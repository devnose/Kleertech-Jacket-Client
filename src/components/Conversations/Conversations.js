import { useEffect } from "react";
import { useState } from "react"
import axios from "axios";
import "./conversations.css"

export default function Conversations({conversations, currentUser, newMessage}) {
    const[user,setUser] = useState(null); 
    const[unreadMessage, setUnreadMessage] = useState(null); 
    const[message , setMessage] = useState(null); 
    const[alerts, setAlerts] = useState(0); 

    useEffect(() => {
       const friendId = conversations.members.find(m=>m !== currentUser[0]._id )
       console.log('conversations:' + currentUser[0]._id)
       console.log(friendId); 
       console.log(conversations)


       const getLastMessage = async () => {
        const convoId = conversations._id; 

        try {
            const res = await axios("http://192.168.168.173:8090/api/messages/"+convoId); 
            console.log(res.data)
            setMessage(res.data[res.data.length - 1]?.text); 
        } catch (err){
            console.log(err)
        }
       }

        const getUser = async ()=> {
            try {
                console.log(friendId)
                const res = await axios("http://192.168.168.173:8090/api/user?userId=" + friendId)
                console.log(res.data.userId); 
                setUser(res.data.userId)
                

    
         
     
            } catch (err) {
                console.log(err); 
            }        
        }; 

        const checkNewMessage = async () => {
          
            try {

                const res = await axios.get('http://192.168.168.173:8090/api/alert/'+currentUser[0]._id); 
                
                if(res.data.length === 0){
                    setUnreadMessage(false); 
                    setAlerts("");
                } else {

                    for(var x = 0; x < res.data.length; x++){

                        
                    if(res.data[x].sender == friendId && res.data[x].friendId == currentUser[0]._id && res.data[x].newMessage){
                        setUnreadMessage(res.data[x].newMessage)
                        setAlerts(1); 
                    }
                        
                    }

                    
                }
                

                // if(currentUser[0]._id == res.data[0]._id && friendId == res.data[0].friendId){
                //     setUnreadMessage(res.data[0].newMessage)
                //     if(res.data[0].newMessage){
                //         setAlerts(1)
                //     } else {
                //     setAlerts("")
                //     }
                //     console.log('working')
    
                // }
 
            } catch (err){
                console.log(err)
            }

            // console.log(data); 
            // console.log(friendId); 
            // console.log(currentUser[0]._id)

            // if(currentUser[0]._id == data._id && friendId == data.friendId){
            //     setUnreadMessage(data.newMessage)

            // }
        }
        getLastMessage()
        getUser()
        checkNewMessage()

        setInterval(() => {
            checkNewMessage()

        }, 10000);
      
        
    }, [currentUser, conversations]); 



        const seeAlerts = async () => {
            const friendId = conversations.members.find(m=>m !== currentUser[0]._id )

            const data = {
                "sender": friendId,
                "friendId": currentUser[0]._id
              }

            const res = await axios.post("http://192.168.168.173:8090/api/alert/updateAlert", data); 
            console.log(res); 
            setUnreadMessage(false)
            setAlerts(0); 


        }


    


    

    return(
        <div className="conversation" onClick={() => seeAlerts()} >
            <div className="chatOnlineImgContainer">
            <div id="profileImage">{user?.split(' ').map(name => name[0]).join('').toUpperCase()}</div>
            
            {/* <div className="chatOnlineBadge"></div> */}
           
            </div>
            <div className="textContainer">
            <span id="name" className="conversationName">{user}</span>
            <span className="preview">{message?.length > 20 ? message.substring(0, 20) : message}...</span>
            </div>

            {unreadMessage ? ( 
            <div className="unreadMessage">{unreadMessage ? alerts : ""}</div> 
): (
    <div className="read"> {unreadMessage ? alerts : ""} </div>
) }
            
        </div>
        
    )
}