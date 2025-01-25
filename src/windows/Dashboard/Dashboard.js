import React, {useState} from 'react'
import Home from '../home/Home'
import {backup} from './api_calls'
import './Dashboard.css'
import Notification from '../Custom/Notification'
import { getDate } from '../Date/Report_Date'
import { base } from '../../proxy_url'
import { ReportGenerator } from '../Reports/ReportGenerator.mjs'


export default function Dashboard() {

    const [status, setStatus] = useState({
        status: "okay",
        message: "Backup Successful",
    });
    const [successNotificationOpen, setSuccessNotificationOpen] = useState(false);
    const [initialRender, setInitialRender] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAnnualReport = async () => {
        try {
            setIsGenerating(true);
            const from = getDate(true); // Last year
            const to = getDate(false); // Current date

            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    suppliers: '[]',
                    parties: '[]',
                    report: 'payment_list',
                    from: from,
                    to: to,
                    supplierAll: true,
                    partyAll: true
                })
            };

            const response = await fetch(base + '/create_report', requestOptions);
            const reportData = await response.json();

            // Generate PDF and convert to blob
            const pdfDoc = ReportGenerator(reportData);
            const pdfBlob = new Blob([pdfDoc.output('arraybuffer')], { type: 'application/pdf' });

            // Send to Telegram
            const formData = new FormData();
            formData.append('chat_id', process.env.REACT_APP_TELEGRAM_CHAT_ID);
            formData.append('document', pdfBlob, 'annual_report.pdf');
            formData.append('caption', `Annual Payment List Report (${from} to ${to})`);

            await fetch(`https://api.telegram.org/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: formData
            });

            setStatus({
                status: "okay",
                message: "Report generated and sent successfully"
            });
            setSuccessNotificationOpen(true);
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                status: "error",
                message: "Failed to generate or send report"
            });
            setSuccessNotificationOpen(true);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
        <Home />
        <div className="dashboard-buttons">
            <button className="button" onClick={() => {backup(setSuccessNotificationOpen)}}>Backup</button>
            <button 
                className="button" 
                onClick={generateAnnualReport}
                disabled={isGenerating}
            >
                {isGenerating ? 'Generating...' : 'Send Payment List'}
            </button>
        </div>
        
        <Notification message="Backup Successful" 
                    severity="success" 
                    status={status}
                    initialRender={initialRender}
                    setInitialRender={setInitialRender}
                    notificationOpen={successNotificationOpen} 
                    setNotificationOpen={setSuccessNotificationOpen} />
        </>
    )
}
