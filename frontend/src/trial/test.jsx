import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';

const TrialTestHaha = () => {

    const applicationId = useParams().applicationId;

    const getFullApplication = async (applicationId, currentStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/general/getApplicationData/${applicationId}`, {
                method: 'GET',
                credentials: 'include',
            });
            console.log(response)
            if (!response.ok) throw new Error(`Failed to fetch application data: ${response.status} ${response.statusText}`);
            const fullApplication = await response.json();
            setApplicationDisplay({ ...fullApplication, currentStatus });
        } catch (error) {
            console.error('Error fetching application data:', error);
        }
    };


    useEffect(() => {

        getFullApplication(applicationId, 'Pending');

    }, [])

    return (
        <div>
            <h1>test</h1>
        </div>
    )
}

export default TrialTestHaha
