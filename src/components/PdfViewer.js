import React, {useState} from "react";
import "antd/dist/antd.css";
import '../App.css';
import {Modal, Button} from "antd";
import {ZoomInOutlined, ZoomOutOutlined} from '@ant-design/icons';
import  PDF from "react-pdf-js";
import { pdfjs } from "react-pdf";
// import { Dna } from  'react-loader-spinner'
import { Dna } from  'react-loader-spinner'



import Snackbar from '@mui/material/Snackbar';

import Buttons from '@mui/material/Button';

import { channels } from '../shared/constants'; 

const { ipcRenderer } = window.require('electron'); 

const axios = require('axios').default;



const PdfViewer = ({pdf, onCancel, visible, username, isLoading})=> {

    var [myPdf, setMyPdf] = useState();
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(null);
    const [scale, setScale] = useState(1);
    const [open, setOpen] = useState(false);

    ipcRenderer.send(channels.GET_USER, 'love')
    ipcRenderer.on(channels.GET_USER, (event, arg) => {
      username = arg; 
  
   }); 




    
  
    const onDocumentComplete = (numPages) =>{
      setPages(numPages)
      //setMyPdf = true; 
    }
  
    const onDocumentError = (err) => {
      console.error('pdf viewer error:', err);
    }

    const onSetScale = (type) =>{

        var newScale = type ? scale + 0.1 : scale - 0.1;

        if (newScale > 2){
            newScale = 2
        } else if (newScale < 0.1){
            newScale = 0.1
        }
        setScale(newScale)
        
    }
  
    const onPage = (type) =>{
  
      var newPage = type ? page + 1 : page - 1
  
      if (newPage > pages){
        newPage = 1
      } else if (newPage < 1){
        newPage = pages
      }
  
      setPage(newPage)
    }

    const print = () => {
        console.log(pdf);
        ipcRenderer.send(channels.GET_DATA, pdf)
          const data = {
            username: username,
            action: 'Printed Document: ' + pdf
          }
        axios.post('http://192.168.168.173:8090/logData', data).then(res => { console.log(res) })
      }
      

    const download = () => {
        
    }

    const zoomStyle = {
        marginLeft: 10,
        cursor: 'pointer'
    }

    const footer = <div className="footer">
       <Button onClick={()=>onPage(0)}>Previous</Button>
       <div>
       <span style={{textAlign: 'center'}}>Page {page} of {pages}</span>
           <ZoomOutOutlined style={{...zoomStyle, opacity: scale === 0.1 ? 0.5 : 1}} onClick={()=>onSetScale(0)}/>
           <ZoomInOutlined style={{...zoomStyle, opacity: scale === 2 ? 0.5 : 1}} onClick={()=>onSetScale(1)}/>
           <span>{Math.round(scale * 100)}%</span>
        </div>
       <Button onClick={()=>onPage(1)}>Next</Button>
       <div className="print">
       <Buttons onClick={()=>print()}>Print</Buttons>
       {/* <Button onClick={()=>download()}>Print</Button> */}


       </div>
   
    </div>





    return (<Modal maskClosable={false}
                   onCancel={onCancel}
                   visible={visible}
                   width={"70%"}
                   bodyStyle={{height: 800, overflowY: 'auto'}}
                   style={{ top: 20 }}
                   footer={footer}
                
    >
    <div className="pdfWrapper">

    <Dna
        visible={!visible}
        height="80"
        width="80"
        ariaLabel="pdf-loading"
        wrapperClass="dna-wrapper"
        />

        <PDF
            file={pdf}
            onDocumentComplete={onDocumentComplete}
            onDocumentError={onDocumentError}
            page={page}
            scale={scale*1.5}
            workerSrc={'http://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js'}
        />
    </div>

 
    </Modal>)
};
export default PdfViewer;