const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");
const axios = require('axios').default;
const { channels } = require("../src/shared/constants");
const os = require('os');
const { TokenRounded } = require("@mui/icons-material");
const { Notification } = require("electron/main");


let userId; 
const addUser = async () => {
   const username = os.userInfo().username.toString()
// const username = "testing"
  axios
    .get("http://192.168.168.173:8090/api/user/" +  username)
    .then((res) => {
      if (res.data.length === 0) {
        axios
          .post("http://192.168.168.173:8090/api/user/add", {
            userId: username,
            email: "kleertech@kleertech.com",
          })
          .then((res) => {
            console.log("bagger: " + res.data._id);
            addConversations(res.data._id);
            addChannels(res.data._id);
            userId = res.data._id;
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        userId = res.data[0]?._id;
   
      }
    });
};

const addConversations = async (userid) => {
  try {
    const res = await axios.get(
      "http://192.168.168.173:8090/api/user/usersList/"
    );
    const data = res.data;
// 
    const keys = Object.keys(data);
    console.log(keys);

    for (var x = 0; x < keys.length; x++) {
      if (keys[x] === userid) {
        keys.splice(x, 1);
      } else {
        const data = {
          senderId: userid,
          receiverId: keys[x],
        };
        haveConversation(data);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

addUser();

async function addChannels(id) {
  try {
    const res = await axios.post(
      "http://192.168.168.173:8090/api/channel/add/" + id
    );
    console.log(res.data);
  } catch (err) {
    console.log(err);
  }
}

async function haveConversation(data) {
  try {
    const res = await axios.post(
      "http://192.168.168.173:8090/api/conversations/api",
      data
    );
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}


async function findNotification(){
  try {
    const res = await axios.post(
      "http://192.168.168.173:8090/startwatch"
    ); 

    if(res.status == 200){

      showNotification(res.data)
    }

    
  } catch (err) {
    
  }
}

setInterval(() => {

  findNotification()

  
}, 10000);


    setTimeout(() => {
        console.log(userId)
        ipcMain.on(channels.SEND_USERID, (event, arg) => {
            event.sender.send(channels.SEND_USERID, userId);
          });
          
    }, 5000);








function showNotification (payload) {
  new Notification({ title:payload.title, body: payload.body}).show()
}



module.exports = addUser; 