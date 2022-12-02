import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import '../App.css';
import {Modal, Button} from "antd";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { DocumentViewer } from 'react-documents';
import PdfViewer from "./PdfViewer";
import  PDF from "react-pdf-js";
import parse from 'html-react-parser';
import {ZoomInOutlined, ZoomOutOutlined} from '@ant-design/icons';
import LoadingSpinner from "./LoadingSpinner";


const axios = require('axios').default;




const MsgViewer = ({doc, onCancel, visible, msg}) => {

   

    const [myPdf, setMyPdf] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(null);
    const [scale, setScale] = useState(1);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);






    const onDocumentComplete = (numPages) =>{
        setPages(numPages)
        console.log("onDocumentComplete"); 
        setTimeout(() => {
            setIsLoading(false); 
        }, 3000);

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

const openPdf = () => {
    setOpen(true);
    setMyPdf(true);
 }

 const zoomStyle = {
    marginLeft: 10,
    cursor: 'pointer'
}



    // const footer = <div className="footer"><Button onClick={()=>openPdf()}>Attachments</Button></div>

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
       {/* <Button onClick={()=>download()}>Print</Button> */}


       </div>
       </div>

    return (<Modal maskClosable={false}
        onCancel={onCancel}
        visible={visible}
        width={"70%"}
        bodyStyle={{height: 800, overflowY: 'auto'}}
        style={{ top: 20 }}
        footer={footer}>


        {isLoading ? <LoadingSpinner/>: false}
        <PDF
            file={msg}
            onDocumentComplete={onDocumentComplete}
            onDocumentError={onDocumentError}
            page={page}
            scale={scale}
            workerSrc={'http://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js'}
        />

{/* 
<PdfViewer pdf={doc}
onCancel={() => setMyPdf(false)}
visible={myPdf}>
</PdfViewer> */}

</Modal>)
}

export default MsgViewer
