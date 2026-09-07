const axios = require('axios');
const fs = require('fs');

const PLAYLIST_URL = 'https://raw.githubusercontent.com/bdtechexpert/live-tv-playlist/refs/heads/main/live-tv-playlist.m3u';

async function fetchPlaylist() {
    const response = await axios.get(PLAYLIST_URL);
    return response.data;
}

function parseM3U(data) {
    const lines = data.split('\n');
    const channels = [];
    let currentChannel = { rawHeader: '' };

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
            let header = line;
            let groupName = 'General';

            const groupMatch = header.match(/group-title="([^"]*)"/);
            if (groupMatch) {
                groupName = groupMatch[1];
            }

            const newGroupTitle = `🌎 Toffee ${groupName}`;
            if (header.includes('group-title="')) {
                header = header.replace(/group-title="([^"]*)"/, `group-title="${newGroupTitle}"`);
            } else {
                header = header.replace('#EXTINF:-1', `#EXTINF:-1 group-title="${newGroupTitle}"`);
            }

            currentChannel.rawHeader = header;
            
            const nameMatch = line.match(/,(.+)$/);
            currentChannel.name = nameMatch ? nameMatch[1] : 'Unknown';
        } else if (line && !line.startsWith('#')) {
            currentChannel.url = line;
            
            if (currentChannel.url.toLowerCase().includes('toffee')) {
                channels.push({ ...currentChannel });
            }
            
            currentChannel = { rawHeader: '' };
        }
    }
    return channels;
}

async function main() {
    console.log('प्लेलिस्ट डाउनलोड हो रही है...');
    const rawData = await fetchPlaylist();
    const channels = parseM3U(rawData);
    
    console.log(`Toffee वाले कुल ${channels.length} चैनल मिल गए हैं।`);

    let m3uContent = '#EXTM3U\n';
    channels.forEach(ch => {
        m3uContent += `${ch.rawHeader}\n${ch.url}\n`;
    });

    fs.writeFileSync('toffy.m3u', m3uContent);
    console.log(`\nकाम पूरा हुआ! कुल ${channels.length} चैनल 'toffy.m3u' में सेव हो गए हैं।`);
}

main();
