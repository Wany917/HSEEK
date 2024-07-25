'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import { sendFile, getFiles, deleteFile, checkAnalysisResult } from 'src/api/file';
import Iconify from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';
import FileStorageOverview from '../../../file-manager/file-storage-overview';

import '../styles/overview-file-view.css';

const GB = 1000000000 * 24;

export default function OverviewFileView() {
  const settings = useSettingsContext();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const aStatRef = useRef(null); // Use useRef for aStat
  const loadingRef = useRef(null);

  const resetAnalysisStatusMessage = () => {
    if (aStatRef.current) {
      aStatRef.current.textContent = '';
    }
  };

  const invertLoadingVisibility = () => {
    if (loadingRef.current) {
      let visibility = loadingRef.current.style.visibility;
  
      if (visibility === "hidden" || visibility === "") {
        loadingRef.current.style.visibility = "visible";
      } else {
        loadingRef.current.style.visibility = "hidden";
      }
    }
  }
  

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear error before fetching files
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
      const newAnalysisResults = {};
      fetchedFiles.forEach((file) => {
        if (file.analysisResult) {
          newAnalysisResults[file.filename] = file.analysisResult;
        }
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to fetch files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let areFilesFetched = false;

  const handleDrop = useCallback(async (acceptedFiles) => {
    setError(null);  // Clear error before starting upload
    setIsLoading(true);
    resetAnalysisStatusMessage();
    let wasError = false;
    try {
      const uploadPromises = acceptedFiles.map((file) => sendFile(file));
      await Promise.all(uploadPromises);
      fetchFiles();
      if (aStatRef.current) {
        invertLoadingVisibility()
        aStatRef.current.textContent = 'Analysis in progress';
      } 
    } catch (err) {
      wasError = true;
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);

      await wait(1000);
      while(!areFilesFetched){

        handleCheckAllAnalysis();
        await wait(2000);

      }
      if (aStatRef.current && wasError){
        aStatRef.current.textContent = 'Error uploading file !';
      }
    }
  }, [fetchFiles]);

  const handleDownload = useCallback((fileName) => {
    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/${fileName}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDelete = useCallback(async (fileName) => {
    setIsLoading(true);
    setError(null);  // Clear error before starting delete
    try {
      await deleteFile(fileName);
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFiles]);

  const handleCheckAllAnalysis = useCallback(async () => {
    resetAnalysisStatusMessage();
    setIsLoading(true);
    setError(null);  // Clear error before starting analysis check
    let resultMessage = '';
    try {
      const result = await checkAnalysisResult();
      resultMessage = result.message;
      await fetchFiles();
      areFilesFetched = true;
    } catch (err) {
      setError('Failed to check analysis results. Please try again.');
    } finally {
      setIsLoading(false);
      if (aStatRef.current) {
        aStatRef.current.textContent = resultMessage;
      }
      invertLoadingVisibility();
    }
  }, [fetchFiles]);

  const renderStorageOverview = (
    <FileStorageOverview
      total={GB}
      chart={{
        series: 76,
      }}
      data={[
        {
          name: 'Files',
          usedStorage: GB / 2,
          filesCount: files.length,
          icon: <Box component="img" src="/assets/icons/files/ic_file.svg" />,
        },
      ]}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        File Analysis Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <UploadBox
              onDrop={handleDrop}
              placeholder={
                <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">Drop or Select file</Typography>
                </Stack>
              }
              sx={{
                py: 5,
                width: 'auto',
                height: '300px',
                borderRadius: 1.5,
              }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}

            <Typography variant="h6">
              Analysis Status : <div className='analysisStatus'><p className="aStat" ref={aStatRef}></p><img ref={loadingRef} className="loading" src="/assets/images/loading.gif" heigt="75" width="75"/></div>
            </Typography>
            <Typography variant="h6">Uploaded Files :</Typography>
            {/* <Button
              variant="contained"
              color="primary"
              onClick={handleCheckAllAnalysis}
              disabled={isLoading}
            >
              Check All Analysis Results
            </Button> */}
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>
                        {file.filename}
                      </Typography>
                      {file.analysisResult ? (
                        <Box>
                          <Typography variant="body2">
                            Known viruses: {file.analysisResult.knownViruses}
                          </Typography>
                          <Typography variant="body2">
                            Files scanned: {file.analysisResult.scannedFiles}
                          </Typography>
                          <Typography variant="body2">
                            Infected files: {file.analysisResult.infectedFiles}
                          </Typography>
                          <Typography variant="body2">
                            Scan time: {file.analysisResult.scanTime} seconds
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No analysis result available
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton
                        aria-label="download"
                        onClick={() => handleDownload(file.filename)}
                      >
                        <Iconify icon="mdi:download" />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => handleDelete(file.filename)}>
                        <Iconify icon="mdi:delete" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          {renderStorageOverview}
        </Grid>
      </Grid>
    </Container>
  );
}
