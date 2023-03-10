// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");
const Electrolytic = require('electrolytic');
const fs = require('fs');
const path = require("path");
const os = require('os');
const { channels } = require("../src/shared/constants");
const { exec } = require('child_process');
const isDev = require("electron-is-dev");
const { Notification } = require("electron/main");
const { autoUpdater } = require('electron-updater');
const axios = require('axios').default;
const addUser = require('./DB'); 
const {setPrinter} = require('./PrintPdf')
const printer = require('./PrintPdf')


const username = os.userInfo().username.toString();
// const username = 'Townsend'

printer; 

//check for updates and install dependecies via cmd 
if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name);
    installDependency(); 
}

// sets up the notifications for electron
const electrolytic = Electrolytic({
  appKey: 'SaNj56fX5KN7FO008uGz'
}); 

const id = async () => {
  const res =  await axios.get('http://localhost:8090/api/user/'+username); 
  console.log('restest: '+res.data[0]._id);
  return Promise.resolve(res.data[0]._id)

}



electrolytic.on('token', token => {

  
  
    console.log(token); 
    axios.post('http://localhost:8090/token', {token: token}).then(res => {console.log(res.data)}).catch(function (error) {console.log(error)}); 
    (async () => {
          axios.post('http://localhost:8090/api/user/token',{userId: username, tokenId: token, _id: await id()}).then(res => {console.log(res.data)}).catch(function (error) {console.log(error)}); 

    })()
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
    width: 900,
    height: 800,
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
  // In development, set it to localhost to allow live/hot-reloading.

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
      //console.log(contents[x]);
      if(contents[x].isDefault){
        console.log('tag: '+contents[x].name)
        defaultPrinter = contents[x].name;
        console.log(defaultPrinter)
        setPrinter(contents[x].name)
      }
    }
  })().catch((err) => {
    console.log(err);
  })

  //updater 
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



// ipcMain.on(channels.GET_JACKET, (event, arg) => {
//   console.log(arg); 
//     showNotification()
  
    
  

//   if(arg == 'start'){

//     fs.mkdtemp(path.join(os.tmpdir(), `print-29938-`), (err, folder) => {
//       event.sender.send(channels.GET_JACKET, folder); 
//       console.log(folder)
//     });

//   }
//       if(arg != 'start'){

//       setTimeout(() => {
        
//           var files = fs.readdirSync(arg.dir)
//             console.log(files); 
//                   for(var x = 0; x < files.length; x++){

//                     if(files[x].includes('.pdf')){
//         print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter}" `+`"${arg.dir}\\${files[x]}" `); 
//          if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')){
//           console.log(files[x]); 
//          print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter}" `+`"${arg.dir}\\${files[x]}"`); 


//          }
//         }
//      }
//     }, 5000);
//       }

  


      


  

// })




//     ipcMain.on(channels.GET_DATA, (event, arg) => {
//         const file = arg.substring(arg.lastIndexOf('/')+1); 


//         if(defaultPrinter == undefined){
//           console.log('woah no defualt printer was found. Please select your default printer and print again'); 
//           ipcRenderer.send(channels.GET_PRINTSTATUS, false); 

//         } else {
          
//                 print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF &&  SumatraPDF.exe -print-to "${defaultPrinter}" `+`"P:\\${direc}"`);
          

//         }
        

//     });



//     ipcMain.on(channels.GET_PRINTER, (event, arg) => {
//       const file = arg
//       console.log(arg);


//   });


//   ipcMain.on(channels.GET_DIRECT, (event, arg) => {
//     const file = arg
//     directory = arg; 
//     console.log(arg);
//     direc = arg;
// });



//     function print(arg){
//         switch (process.platform) {
//             case 'darwin':
//             case 'linux':
//                 exec(
//                     'lp ' + arg, (e) => {
//                         if (e) {
//                             throw e;
//                         }
//                     });
//                 break;
//             case 'win32':
//                 exec(
//                     arg, {
//                         windowsHide: true
//                     }, (e) => {
//                         if (e) {
//                           console.log(e)
//                             throw e;
//                         }
//                     });
//                 break;
//             default:
//                 throw new Error(
//                     'Platform not supported.'
//                 );
//         }
//     }


    function installDependency() {
      // if(process.platform === 'win32'){
      //   console.log(username)
      //     exec(`"C:\\Users\\aaront\\AppData\\Local\\Temp\\SumatraPDF-3.4.6-64-install.exe -s`); 
       
      //     console.log('Sumatra PDF installed')
      // }


       exec(
        String.raw`C:\\Users\\${username}\\AppData\\Local\\Temp\\SumatraPDF-3.4.6-64-install.exe -s"`,
        (error, stdout, stderr) => {
          console.log("linux test");
          console.log("------error:    ", error);
          console.log("++++++stdout:   ", stdout);
          console.log("```````stderr:  ", stderr);
        }
      );
    }



// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(channels.GET_USER, (event, arg) => {
      console.log(arg)
  event.sender.send(channels.GET_USER, username); 
  console.log('arguments dsfadfdjsfkj')
  // new Notification("hello", {body: "Wassup Bitch"})
  // .onclick = () => document.getElementById('output').innerText = "Clicked!"
}); 

ipcMain.on(channels.UPLOAD_FILE, (event, arg) => {
  console.log(arg)
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



