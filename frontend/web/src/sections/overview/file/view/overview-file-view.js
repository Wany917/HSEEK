'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
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

const GB = 1000000000 * 24;

export default function OverviewFileView() {
  const settings = useSettingsContext();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback(async (acceptedFiles) => {
    setIsLoading(true);
    try {
      const uploadPromises = acceptedFiles.map((file) => sendFile(file));
      await Promise.all(uploadPromises);
      fetchFiles();
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    try {
      await deleteFile(fileName);
      fetchFiles();
      setError(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async (fileName) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await checkAnalysisResult(fileName);
      console.log('Analysis result:', result); // Pour le débogage
      if (result && result.result) {
        setAnalysisResults((prev) => ({ ...prev, [fileName]: result.result }));
      } else {
        setError('Analysis result not available yet.');
      }
    } catch (err) {
      console.error('Error analyzing file:', err);
      setError('Failed to analyze file or analysis timed out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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

            <Typography variant="h6">Uploaded Files:</Typography>

            <Grid container spacing={2}>
              {files.map((file, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>
                        {file}
                      </Typography>
                      {analysisResults[file] ? (
                        <Box>
                          <Typography variant="body2">
                            Known viruses: {analysisResults[file].knownViruses}
                          </Typography>
                          <Typography variant="body2">
                            Scanned files: {analysisResults[file].scannedFiles}
                          </Typography>
                          <Typography variant="body2">
                            Infected files: {analysisResults[file].infectedFiles}
                          </Typography>
                          <Typography variant="body2">
                            Scan time: {analysisResults[file].scanTime} seconds
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No analysis results available
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton aria-label="analyze" onClick={() => handleAnalyze(file)}>
                        <Iconify icon="mdi:magnify" />
                      </IconButton>
                      <IconButton aria-label="download" onClick={() => handleDownload(file)}>
                        <Iconify icon="mdi:download" />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => handleDelete(file)}>
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
