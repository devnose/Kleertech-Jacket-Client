import React,{useEffect, useState} from "react"; 
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import {Modal, Button} from "antd";
import {ZoomInOutlined, ZoomOutOutlined} from '@ant-design/icons';
import '../App.css';
import "antd/dist/antd.css";


const ModalLogger = ({onCancel, visible}) => {

    const [logger, setLogger] = useState([]);

    useEffect(() => {


            setInterval(() => {

                fetch('http://192.168.168.173:8090/log')
                .then(response => response.json())
                .then(data => setLogger(data.reverse()))
    
    
            }, 5000);
          
    },[]); 
    

      


    return (

        <Modal maskClosable={false}
                   onCancel={onCancel}
                   open={visible}
                   width={"70%"}
                   bodyStyle={{height: 500, overflowY: 'auto'}}
                   style={{ top: 20 }}
                   >


<div className='logger'>
                 {logger.length > 0 && (
                     <div>
                     {logger.map((logger) => (
                        
                              
                                 <p className='fade-in' >{logger['Date'] + logger['Username']+' '+logger['Action']} </p>
                               
                     ))}
                     </div>
                 )}
             </div>

                   </Modal>

    )

    
}

export default ModalLogger