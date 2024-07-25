'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
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
import { sendFile, getFiles, deleteInScanResult, checkAnalysisResult } from 'src/api/file';
import Iconify from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';
import '../styles/overview-file-view.css';
import FileStorageOverview from '../../../file-manager/file-storage-overview';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { margin: 10, padding: 10, fontSize: 12 },
});

const FileAnalysisDocument = ({ file }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text>Filename: {file.filename}</Text>
      </View>
      <View style={styles.section}>
        <Text>Known viruses: {file.analysisResult.knownViruses}</Text>
      </View>
      <View style={styles.section}>
        <Text>Files scanned: {file.analysisResult.scannedFiles}</Text>
      </View>
      <View style={styles.section}>
        <Text>Infected files: {file.analysisResult.infectedFiles}</Text>
      </View>
      <View style={styles.section}>
        <Text>Scan time: {file.analysisResult.scanTime} seconds</Text>
      </View>
    </Page>
  </Document>
);

export default function OverviewFileView() {
  const settings = useSettingsContext();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const aStatRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const resetAnalysisStatusMessage = () => {
    if (aStatRef.current) {
      aStatRef.current.textContent = '';
    }
  };

  const fetchFiles = useCallback(async () => {
    setError(null);
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
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let areFilesFetched = false;

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      setError(null);
      setIsLoading(true);
      resetAnalysisStatusMessage();
      let wasError = false;
      try {
        const uploadPromises = acceptedFiles.map((file) => sendFile(file));
        await Promise.all(uploadPromises);
        fetchFiles();
        if (aStatRef.current) {
          aStatRef.current.textContent = 'Analysis is still in progress';
        }
      } catch (err) {
        wasError = true;
        setError('Failed to upload file. Please try again.');
      } finally {
        if (aStatRef.current && wasError) {
          aStatRef.current.textContent = 'Error uploading file !';
        }
        await wait(1000);
        while (!areFilesFetched) {
          handleCheckAllAnalysis();
          await wait(2000);
        }
        setIsLoading(false);
        aStatRef.current.textContent = 'Analysis Finished !';
        fetchFiles();
      }
    },
    [fetchFiles]
  );

  const handleCheckAllAnalysis = useCallback(async () => {
    setError(null);
    let resultMessage = '';
    try {
      const result = await checkAnalysisResult();
      resultMessage = result.message;
      await fetchFiles();
      if (result?.result) {
        areFilesFetched = true;
      } else {
        areFilesFetched = false;
      }
    } catch (err) {
      setError('Failed to check analysis results. Please try again.');
    }
  }, [fetchFiles]);

  const removeExtension = (filename) => {
    const parts = filename.split('.');
    parts.pop();
    return parts.join('.');
  };

  const handleDownload = useCallback(
    async (file) => {
      const blob = await pdf(<FileAnalysisDocument file={file} />).toBlob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      let fname = removeExtension(file.filename)
      link.download = `${fname}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
    },
    []
  );

  const handleDelete = useCallback(
    async (fileId) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await deleteInScanResult(fileId);
        await fetchFiles();
        setSuccess(true);
      } catch (err) {
        console.error('Error deleting file:', err);
        setError('Failed to delete file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFiles]
  );

  const renderStorageOverview = (
    <FileStorageOverview
      data={[
        {
          name: 'Files',
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
            {success && <Alert severity="success"> File deleted successfully </Alert>}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}

            <Typography variant="h6">
              Analysis Status : <div className='analysisStatus'><p className="aStat" ref={aStatRef} /></div>
            </Typography>
            <Typography variant="h6">Uploaded Files :</Typography>

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
                        onClick={() => handleDownload(file)}
                      >
                        <Iconify icon="mdi:download" />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => handleDelete(file.id)}>
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
