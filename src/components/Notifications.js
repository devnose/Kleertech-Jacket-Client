import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import '../App.css';
import {Modal, Button} from "antd";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { DocumentViewer } from 'react-documents';
import PdfViewer from "./PdfViewer";
import  PDF from "react-pdf-js";
import parse from 'html-react-parser';
import NotificationProvider, { useNotification } from 'use-toast-notification'
import { ToastContainer, toast } from 'react-toastify';


const axios = require('axios').default;




const Notifications = ({doc, onCancel, visible, msg}) => {
    const notification = useNotification()


    const [newJob, setNewJob] = useState([]); 




    useEffect(() => {
        const check = async () => {
            console.log('checking')
            try {
                const response = await axios.get('http://localhost:8090/notify');
                console.log(response); 
                const mine = response.data;
                console.log(mine)
                setNewJob(mine); 

                if(mine.length >= 1){
                    console.log('submit')
                    handleSubmit(mine)
                }

            } catch (error) {
                console.log(error)
            }
        };

        setInterval(()=>{

            check();


        },3000)
    }, []); 

    
  const handleSubmit = async (path) => {
    
        notification.show({
            message: `New Order Created 
            ${path}`, 
            title: 'New Job Order',
            variant: 'success'
        })
    
  }


}


const Main = () =>{
    const handleSubmit = async (e) => {
        console.log('hey')
    }

    return (
        <NotificationProvider
        onclick={handleSubmit}
			config={{
				position: 'bottom-right',
				isCloseable: true,
				showTitle: true,
				showIcon: true,
				duration: 500000000,
                
			}}
		>
            <Notifications/>
        </NotificationProvider>
    )
}

export default Main