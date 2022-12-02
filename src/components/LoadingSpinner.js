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
import { Dna } from  'react-loader-spinner'


const axios = require('axios').default;




const LoadingSpinner = ({isLoading}) => {

   

    const [myPdf, setMyPdf] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(null);
    const [scale, setScale] = useState(1);
    const [open, setOpen] = useState(false);


    return (
        <Dna
        visible={!isLoading}
        height="80"
        width="80"
        ariaLabel="pdf-loading"
        wrapperClass="dna-wrapper"
        />
    )
}

export default LoadingSpinner
