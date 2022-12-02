import axios from 'axios';
import moment from 'moment'
import React, { useEffect, useState } from "react";

export default function GroupMessage({message, own, user, title}){

    const [friend, setFriend] = useState("");


    useEffect(() => {
        console.log(message.sender); 
        const getUsername = async () => {

            const res = await axios.get('http://192.168.168.173:8090/api/user/id/'+message.sender); 
            console.log(res.data[0].userId)
            setFriend(res.data[0].userId); 
        }; 

        getUsername()

    
    })

    return (
        <div className={own ? "message own" : "message" }>
            <div className='messageTop'>
            <div id="profileImageMessage">{ own ? user[0].userId?.split(' ').map(name => name[0]).join('').toUpperCase() : friend?.split(' ').map(name => name[0]).join('').toUpperCase()}</div>
            <p className='messageText'>
                {message.text}
            </p>
            </div>
            <div className='messageBottom'>{moment(message.createdAt).fromNow()}</div>

        </div>
    )
}