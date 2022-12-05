const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");


ipcMain.on(channels.GET_USER, (event, arg) => {
  console.log(arg)
event.sender.send(channels.GET_USER, username); 
console.log('arguments dsfadfdjsfkj')
new Notification("hello", {body: "Wassup Bitch"})
.onclick = () => document.getElementById('output').innerText = "Clicked!"
}); 


