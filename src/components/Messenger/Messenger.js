import React, { useEffect, useState } from "react";
import "./messenger.css";

import { EaseApp } from "agora-chat-uikit";
import Conversations from "../Conversations/Conversations";
import Group from "../Groups/Groups"
import Message from "../Message/Message.js";
import GroupMessage from "../GroupMessage/GroupMessage";
import SubMenu from "../SubMenu/SubMenu";
import axios from "axios";

import { channels } from "../../shared/constants";
import { useRef } from "react";
import {io} from "socket.io-client"

const { ipcRenderer } = window.require("electron");

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]); 
  const [groupClicked, setGroupClicked] = useState(null); 
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [title, setTitle] = useState("");

  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 

  const socket = useRef(); 
  const [id, setId] = useState([]);
  const scrollRef = useRef(); 

  var user;
  //recieving username from backend electron

  useEffect(() => {

    socket.current = io("ws://192.168.168.173:9000");
    socket.current.on("getMessage", (data) => {
        setArrivalMessage({
            sender: data.senderId,
            text: data.text,
            createdAt: Date.now()
        })
    })

  }, []); 



  useEffect(() => {

    arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
    setMessages((prev) => [...prev, arrivalMessage])

  },[arrivalMessage, currentChat])


  useEffect(() => {
    
    ipcRenderer.send(channels.SEND_USERID, "I need UserId");
    ipcRenderer.on(channels.SEND_USERID, (event, arg) => {
  console.log(arg); 
  socket.current.emit("addUser", arg); 
  socket.current.on("getUsers", users => {
      setOnlineUsers(users); 
  })
});
  
  },[id]); 


  useEffect(() => {
    const getUsers = async () => {
        try{
            const res = await axios.get("http://192.168.168.173:8090/api/user/usersList/");
            console.log(res.data) 
            setAllUsers(res.data); 
        } catch (err) {
            console.log(err); 
        }
    }
    getUsers(); 
  }, []); 



  useEffect(() => {
    ipcRenderer.send(channels.GET_USER, "love");
    ipcRenderer.on(channels.GET_USER, (event, arg) => {
      const getUserId = async () => {
        try {
          const res = await axios.get(
            "http://192.168.168.173:8090/api/user/" + arg
          );
          setId(res.data[0]._id);
          console.log(res.data[0]._id);
          setUsername(res.data);
          getConversations(res.data[0]._id);
          getChannels(res.data[0]._id)
        } catch (err) {
          console.log(err);
        }
      };

      const getConversations = async (id) => {
        try {
          const res = await axios.get(
            "http://192.168.168.173:8090/api/conversations/" + id
          );
          console.log(res);
          setConversations(res.data);
        } catch (err) {
          console.log(err);
        }
      };

      const getChannels = async (id) => {

        try {
        const res = await axios.get("http://192.168.168.173:8090/api/channel/" + id); 
        console.log(res); 
        setGroups(res.data);  
        } catch (err) {
          console.log(err); 
        }
    
      }
      getUserId();
    });
  }, [id]);

useEffect(() => {



},[])





  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get(
          "http://192.168.168.173:8090/api/messages/" + currentChat?._id
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);


  const friendlyClick = async (c) => {
    console.log(c.members[1])
    setCurrentChat(c); 
try {
  const friendId = c.members.find(m=>m !== username[0]._id )
    const res = await axios.get("http://192.168.168.173:8090/api/user/id/"+friendId); 
    console.log(res.data)
    setTitle(res.data[0].userId); 
} catch(err){
  console.log(err); 
}
  }


  const groupyClick = async (c) => {
    setGroupClicked(true); 
    setCurrentChat(c); 
    try {
      const friendId = c.members.find(m=>m !== username[0]._id )
        const res = await axios.get("http://192.168.168.173:8090/api/user/id/"+friendId); 
        console.log(res.data)
        setTitle('#Warehouse'); 
    } catch(err){
      console.log(err); 
    }
  }




const handleSubmit = async (e) => {
    e.preventDefault(); 
    const message = {
        sender: id, 
        text: newMessage,
        conversationId: currentChat._id
    }; 

    const receiverId = currentChat.members.find(member => member !== id); 

    socket.current.emit("sendMessage", {
        senderId: id, 
        receiverId,
        text: newMessage

    }); 

 

    try {
        const res = await axios.post("http://192.168.168.173:8090/api/messages", message); 
        setMessages([...messages, res.data]); 
        setNewMessage("")

    } catch(err){
        console.log(err)
    }

    try {
        console.log('trying')
        const alertData  = {

            "sender":id ,
            "friendId": receiverId,
            "newMessage": true
        }
        const res = await axios.post('http://192.168.168.173:8090/api/alert/', alertData); 
        console.log(res.data); 

    } catch(err) {
        console.log(err); 
    }
}










useEffect(() => {
    scrollRef.current?.scrollIntoView({behavior: "smooth"})

},[messages])
  return (
    <div className="messenger">
      <div className="chatMenu">
        <input placeholder="Search for members" className="chatMenuInput" />

        <div className="chatMenuWrapper">
          <SubMenu groups={'Direct Messages'} />
          {/* {Object.keys(allUsers).map((userId, i) => (
       
            <div key={i} onClick={() => setChat()}>
            <Conversations conversations={allUsers[userId]} currentUser={username}/> 
            </div>
          ))} */}
          {conversations.map((c) => (
            <div onClick={() => friendlyClick(c)}>
              <Conversations conversations={c} currentUser={username} message={newMessage} />
            </div>
          ))}
          <SubMenu groups={'Channels'}/>
            {groups.map((s) => (
              <div onClick={() => groupyClick(s)}>
                <Group groupName={s.channel} groups={s} currentUser={username} message={newMessage} />
                </div>
            ))}
           
        </div>
      </div>
      <div className="chatBox">
        <div className="chatBoxHeader">
          <span className="chatBoxTitle">{title.toUpperCase()}</span>
        </div>
        <div className="chatBoxWrapper">
          { groupClicked ? (
              <>
              <div className="chatBoxTop">
              {messages.map((m) => (
                    <div ref={scrollRef}>
                  <GroupMessage message={m} own={m.sender === id} user={username} title={title} />

                    </div>
                ))}
            </div>
            <div className="chatBoxBottom">
                <input
                  className="chatMessageInput"
                  placeholder="write something..."
                  onChange={(e) =>setNewMessage(e.target.value)}
                  value={newMessage}
                ></input>
                <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
              </div>
            </>
          )
            : currentChat ? (
            <>
              <div className="chatBoxTop">
                {messages.map((m) => (
                    <div ref={scrollRef}>
                  <Message message={m} own={m.sender === id} user={username} title={title} />

                    </div>
                ))}
              </div>
              <div className="chatBoxBottom">
                <input
                  className="chatMessageInput"
                  placeholder="write something..."
                  onChange={(e) =>setNewMessage(e.target.value)}
                  value={newMessage}
                ></input>
                <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              Open a conversation to start a chat
            </span>
          )}
        </div>
      </div>
      {/* <div className='chatOnline'>s
                <div className='chatOnlineWrapper'>
                    online
                </div>

            </div> */}
    </div>

  );
}
