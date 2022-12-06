// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");
const Electrolytic = require('electrolytic');
const fs = require('fs');
const path = require("path");
const url = require("url");
const os = require('os');
const { channels } = require("../src/shared/constants");
const { exec } = require('child_process');
const { dirname } = require("path");
const isDev = require("electron-is-dev");
const { Notification } = require("electron/main");
const { Console } = require("console");
const { getuid } = require("process");
const { autoUpdater } = require('electron-updater');
const axios = require('axios').default;


if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name);
    installDependency(); 
}


const electrolytic = Electrolytic({
  appKey: 'SaNj56fX5KN7FO008uGz'
}); 


electrolytic.on('token', token => {
    console.log(token); 
    axios.post('http://192.168.168.173:8090/token', {token: token}).then(res => {console.log(res)}).catch(function (error) {console.log(error)})
})

electrolytic.on('push', (payload) => {
  console.log('got push notification', payload) // hola, here's a push!
  showNotification(payload)
})



var direc; 
var defaultPrinter ; 
let mainWindow
// Create the native browser window.
function createWindow() {
   mainWindow = new BrowserWindow({
    width: 1000,
    height: 510,
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },

    
  });

  mainWindow.removeMenu()


  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    },
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    });
  });


  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to 192.168.168.173 to allow live/hot-reloading.


  mainWindow.loadURL(
    isDev 
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../index.html")}`
  );
  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
    mainWindow.webContents.openDevTools();
  }

  //find default printer and print 

  (async function() {
    var contents = await mainWindow.webContents.getPrintersAsync(); 
    for(var x = 0; x < contents.length; x++){
      console.log(contents[x]);
      if(contents[x].isDefault){
        console.log('tag: '+contents[x].name)
        defaultPrinter = contents[x].name;
      }
    }
  })().catch((err) => {
    console.log(err);
  })

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify(); 
  })
  
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error("Failed to register protocol");
    }
  );
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})


// const username = os.userInfo().username; 
const username = 'aaront'
var userId; 
console.log(username); 

const addUser = async () => {

    axios.get('http://192.168.168.173:8090/api/user/'+username.toString()).then(res => {

      if(res.data.length === 0){

               axios.post('http://192.168.168.173:8090/api/user/add', {userId: username, email: 'kleertech@kleertech.com'}).then(res => {
               console.log("bagger: "+res.data._id); 
               addConversations(res.data._id); 
               addChannels(res.data._id)
               userId = res.data._id; 

              }).catch(function (error) {
                console.log(error)
              }); 
      } else {

      userId = res.data[0]?._id;
      }

    }); 
}


const addConversations = async (userid) => {

    try {
      const res =  await axios.get("http://192.168.168.173:8090/api/user/usersList/"); 
      const data = res.data;

      const keys = Object.keys(data); 
      console.log(keys)

      for(var x = 0; x < keys.length; x++){
          if(keys[x] === userid){
           keys.splice(x, 1)
          } else {
      const data = {
      "senderId": userid,
      "receiverId": keys[x]
    }  
    haveConversation(data)
          }
      }
       
      

    } catch(err){
      console.log(err); 
    }
}

addUser()
  
//   axios.get('http://192.168.168.173:8090/api/user/'+ username.toString()).then(res => {
   
//     if(res.data.length === 0) {
//     axios.post('http://192.168.168.173:8090/api/user/add', {userId: username, email: 'kleertech@kleertech.com'}).then(res => {
//       console.log(res.data._id); 
//       getUsers(res.data._id)
//     }).catch(function (error)
//     {console.log(error)})

//     } else {
//       console.log(res)
//       userId = res.data[0]?._id
//       getUsers(userId); 
//       console.log(userId)

//     }
//   }).catch(function (error) {
//     console.log(error)
//   })


// async function getUsers(userid){
// try{
//   const res = await axios.get("http://192.168.168.173:8090/api/user/usersList/");
//   console.log(res.data); 
//   const data = res.data; 
  
//  const keys = Object.keys(data); 
//  const ids = [];

//  keys.forEach((key, index) => {
//     console.log(`${key}`); 
//     if(key != userId){
//       const data = {
//         "senderId": userid,
//         "receiverId": key
//       }

//       ids.push(key); 

//       //haveConversation(data)
      
      
//     }
//  })

//  const updated = await checkDuplicate(ids, userId); 

//  const updatedKeys = Object.keys(updated); 

//  for(var c = 0; c < updated.length; c++){

//       const data = {
//       "senderId": userid,
//       "receiverId": updated[c]
//     }  
//     haveConversation(data);
//  }
 

// } catch (err) {
//   console.log(err); 
// }

// }

// async function checkDuplicate(key, userid){

//   console.log('line:188' + key[0])
//   const convoId = [];
  
//   try{
//     const res = await axios.get("http://192.168.168.173:8090/api/conversations/"+userid); 



//       for(var x = 0; x < res.data.length; x++){
        
//         //console.log(res.data[x].members); 
//         convoId.push(res.data[x].members[0])
//         convoId.push(res.data[x].members[1]);
//           }

//           console.log('202: '+convoId);
//           console.log('202: '+key)

//          const found = key.some(r => convoId.indexOf(r)); 

//          for(var x = 0; x < convoId.length; x++){

//          // console.log('keys: '+convoId[x])

//             if(key.includes(convoId[x])){
//                 console.log('keys: '+convoId[x])
//                 const index = key.indexOf(convoId[x]); 
//                 console.log(index)
//                 key.splice(index, 1); 
//             }

//          }


//         console.log(key)
    
//          return key; 
      
//         } catch (err){
//     console.log(err)
//   }
// }

async function addChannels(id){

    try{
      const res = await axios.post('http://192.168.168.173:8090/api/channel/add/'+id); 
      console.log(res.data); 
    } catch(err){
      console.log(err)
    }
}


async function haveConversation( data) {

  try {
    const res  = await axios.post("http://192.168.168.173:8090/api/conversations/api", data); 
    console.log(res)


  } catch(err){
    console.log(err)
  }

}

ipcMain.on(channels.SEND_USERID, (event, arg) => {
  event.sender.send(channels.SEND_USERID, userId); 

}); 




ipcMain.on(channels.GET_JACKET, (event, arg) => {
  console.log(arg); 
    showNotification()
  
    
  

  if(arg == 'start'){

    fs.mkdtemp(path.join(os.tmpdir(), `print-29938-`), (err, folder) => {
      event.sender.send(channels.GET_JACKET, folder); 
      console.log(folder)
    });

  }
      if(arg != 'start'){

      setTimeout(() => {
        
          var files = fs.readdirSync(arg.dir)
            console.log(files); 
                  for(var x = 0; x < files.length; x++){

                    if(files[x].includes('.pdf')){
        print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter}" `+`"${arg.dir}\\${files[x]}" `); 
         if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')){
          console.log(files[x]); 
         print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter}" `+`"${arg.dir}\\${files[x]}"`); 


         }
        }
     }
    }, 5000);
      }

  


      


  

})




    ipcMain.on(channels.GET_DATA, (event, arg) => {
        const file = arg.substring(arg.lastIndexOf('/')+1); 


        if(defaultPrinter == undefined){
          console.log('woah no defualt printer was found. Please select your default printer and print again'); 
          ipcRenderer.send(channels.GET_PRINTSTATUS, false); 

        } else {
          
                print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF &&  SumatraPDF.exe -print-to "${defaultPrinter}" `+`"P:\\${direc}"`);
          

        }
        

    });



    ipcMain.on(channels.GET_PRINTER, (event, arg) => {
      const file = arg
      console.log(arg);


  });


  ipcMain.on(channels.GET_DIRECT, (event, arg) => {
    const file = arg
    directory = arg; 
    console.log(arg);
    direc = arg;
});



    function print(arg){
        switch (process.platform) {
            case 'darwin':
            case 'linux':
                exec(
                    'lp ' + arg, (e) => {
                        if (e) {
                            throw e;
                        }
                    });
                break;
            case 'win32':
                exec(
                    arg, {
                        windowsHide: true
                    }, (e) => {
                        if (e) {
                          console.log(e)
                            throw e;
                        }
                    });
                break;
            default:
                throw new Error(
                    'Platform not supported.'
                );
        }
    }


    function installDependency() {
      if(process.platform === 'win32'){
          exec(" cd C:\\Users\\aaront\\AppData\\Local\\Temp && SumatraPDF-3.4.6-64-install.exe -s "); 
          console.log('Sumatra PDF installed')
      }
    }



// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(channels.GET_USER, (event, arg) => {
      console.log(arg)
  event.sender.send(channels.GET_USER, username); 
  console.log('arguments dsfadfdjsfkj')
  // new Notification("hello", {body: "Wassup Bitch"})
  // .onclick = () => document.getElementById('output').innerText = "Clicked!"
})



const NOTIFICATION_TITLE = 'Kleertech'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification (payload) {
  new Notification({ title: NOTIFICATION_TITLE, body: payload}).show()
}

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});



