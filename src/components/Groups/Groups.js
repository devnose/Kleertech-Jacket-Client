import { useEffect } from "react";
import { useState } from "react"
import axios from "axios";
import "./groups.css"

export default function Conversations({groupName, groups, currentUser, newMessage}) {

    

    return(
        <div className="conversation"  >
            <div className="chatOnlineImgContainer">
            {/* <img
                className="conversationImg"
                src="https://www.seiu1000.org/sites/main/files/main-images/camera_lense_0.jpeg"
                alt=""
            /> */}
            <span>#</span> 
            {/* <div className="chatOnlineBadge"></div> */}
           
            </div>
            <div className="textContainer">
            <span className="conversationName">{groupName}</span>
            <span className="preview">{newMessage}</span>
            </div>

           
        </div>
    )
}