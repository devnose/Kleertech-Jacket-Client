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




const Noti = ({doc, onCancel, visible, msg}) => {
    const notify = () => toast("Wow so easy!");

    return (
      <div>
        <button onClick={notify}>Notify!</button>
        <ToastContainer />
      </div>
    );

}
export default Noti