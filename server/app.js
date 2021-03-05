const http = require('http')
const WebSocketServer = require('websocket').server

var indexed_players = [];
var online_players = [];
var isStart = false;
var isReady = false;
var netTimer = null;

const httpServer = http.createServer((request, response) => {
    console.log('[' + new Date + '] Received request for ' + request.url)
    response.writeHead(404)
    response.end()
})

const wsServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: true
})

function send_data_to_all(d) {
    for (let i = 0; i < indexed_players.length; i++) {
        if (indexed_players[i]) {
            indexed_players[i].conn.sendUTF(JSON.stringify(d));
        }
    }
}

function send_string_to_all(s) {
    for (let i = 0; i < indexed_players.length; i++) {
        if (indexed_players[i]) {
            online_players[i].conn.sendUTF(s);
        }
        
    }
}


wsServer.on('connect', connection => {
    var player = {
        name: '',
        conn: null,
        orderSet: [],
    }

    let index = -1;

    connection.on('message', message => {
        var rev_data = '';
        if (message.type === 'utf8') {
            if (message.utf8Data.charAt(0) == 'A') {
                rev_data = message.utf8Data.replace('A', '');
                console.log(rev_data)
                let player_index = rev_data.split('-')[0];
                indexed_players[player_index].orderSet.push(rev_data);

            } else {
                rev_data = JSON.parse(message.utf8Data);
                console.log(rev_data)
                var send_data = rev_data;
                if (rev_data.type == 'create-player') {
                    if (!isReady) {
                        let playerList = [];
                        player.name = rev_data.data.name;
                        player.conn = connection;
                        index = online_players.push(player) - 1;
                        indexed_players = online_players.slice(0);
                        console.log("Clients numbers:" + online_players.length);
                        for (let i = 0; i < online_players.length; i++) {
                            playerList.push(online_players[i].name)
                        }
                        send_data = {
                            type: 'update-playerList',
                            data: playerList
                        }  
                    }
                     
                } else if (rev_data.type == 'game') {
                    if (rev_data.data.cmd == 'ready') {
                        if (!isReady) {
                            isReady = true;
                            indexed_players = online_players.slice(0);
                        }
                        setTimeout(function () {
                            if (!isStart) {
                                isStart = true;
                                send_string_to_all("game-start");
                                indexed_players = online_players.slice(0);
                                var s_data = '';
                                netTimer = setInterval(function () {
                                    s_data = 'A';
                                    for (let i = 0; i < indexed_players.length; i++) {
                                        //online_players[i].conn.sendUTF(JSON.stringify(data));
                                        if (indexed_players[i] && indexed_players[i].orderSet.length) {
                                            if (i > 0) {
                                                s_data = s_data + '&';
                                            }
                                            s_data = s_data + indexed_players[i].orderSet.shift();
                                            
                                        }
                                    }
                                    send_string_to_all(s_data);    
                                }, 20);
                            }
                        }, 4000)
                    }
                }
                send_data_to_all(send_data);
            }
            
        }
        
        

    })



    connection.on('close', (reasonCode, description) => {
        if (isReady) {
            for (let i = 0; i < indexed_players.length; i++) {

                if (indexed_players[i] && indexed_players[i].conn === connection) {
                    indexed_players[i] = null;
                    console.log('[' + new Date() + '] ' + connection.remoteAddress + ' disconnected.')
                    let send_data = {
                        type: 'player-leave',
                        data: i
                    } 
                    send_data_to_all(send_data);
                    for (let k = 0; k < indexed_players.length; k++) {
                        if (indexed_players[k]) {
                            break;
                        }
                        if (k == indexed_players.length - 1) {
                            clearInterval(netTimer);
                            console.log('Party Over.!');
                            isStart = false;
                            isReady = false;
                            indexed_players = [];
                            online_players = [];
                            netTimer = null;
                            
                            
                        }
                    }
                    break;
                }
                
            }

        } else {
            if (index != - 1) {
                online_players.splice(index, 1);
                let playerList = [];
                console.log("Clients numbers:" + online_players.length);
                for (let i = 0; i < online_players.length; i++) {
                    playerList.push(online_players[i].name)
                }
                send_data = {
                    type: 'update-playerList',
                    data: playerList
                }
                send_data_to_all(send_data);
            }
        }

        

    })
})

httpServer.listen(5050, () => {
    console.log('[' + new Date() + '] Serveris listening on port 5050')
})


