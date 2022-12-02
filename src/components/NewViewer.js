import React,{useState} from "react"; 
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import {Modal, Button} from "antd";
import {ZoomInOutlined, ZoomOutOutlined} from '@ant-design/icons';
import '../App.css';
import "antd/dist/antd.css";




const NewViewer = ({pdf, onCancel, visible}) => {

    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(null); 
    const [pageNumber, setPageNumber] = useState(1); 
    const [scale, setScale] = useState(1);

    function onDocumentLoadSuccess({ numPages}) {
        setNumPages(numPages); 
        setPage(1)
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
  
      if (newPage > numPages){
        newPage = 1
      } else if (newPage < 1){
        newPage = numPages
      }
  
      setPage(newPage)
    }

    const print = () => {

      }

      const zoomStyle = {
        marginLeft: 10,
        cursor: 'pointer'
    }

    const footer = <div className="footer">
    <Button onClick={()=>onPage(0)}>Previous</Button>
    <div>
    <span style={{textAlign: 'center'}}>Page {page} of {numPages}</span>
        <ZoomOutOutlined style={{...zoomStyle, opacity: scale === 0.1 ? 0.5 : 1}} onClick={()=>onSetScale(0)}/>
        <ZoomInOutlined style={{...zoomStyle, opacity: scale === 2 ? 0.5 : 1}} onClick={()=>onSetScale(1)}/>
        <span>{Math.round(scale * 100)}%</span>
     </div>
    <Button onClick={()=>onPage(1)}>Next</Button>
    <div className="print">
    {/* <Button onClick={()=>download()}>Print</Button> */}


    </div>

    </div>

    return (
        <Modal maskClosable={false}
                   onCancel={onCancel}
                   visible={visible}
                   width={"70%"}
                   bodyStyle={{height: 800, overflowY: 'auto'}}
                   style={{ top: 20 }}
                   footer={footer}>
            <Document
                file={pdf}
                onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={page}
                        
                        scale={scale} />
                    <p>Page {pageNumber} of {numPages}</p>

            </Document>
            </Modal>
    )
}

export default NewViewer