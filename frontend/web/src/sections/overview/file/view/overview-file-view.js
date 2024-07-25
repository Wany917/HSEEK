'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { pdf, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';

import {
  scanUrl,
  sendFile,
  getFiles,
  deleteInScanResult,
  checkAnalysisResult,
} from 'src/api/file';

import Iconify from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';

import '../styles/overview-file-view.css';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    fontSize: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    margin: 'auto',
    marginTop: 50,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
  },
});

const FileAnalysisDocument = ({ file }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>HollowSeek: Analysis Report</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Filename</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{file.filename}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Known viruses</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{file.analysisResult.knownViruses}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Files scanned</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{file.analysisResult.scannedFiles}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Infected files</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{file.analysisResult.infectedFiles}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Scan time</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{file.analysisResult.scanTime} seconds</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

const getCategoryDescription = (category) => {
  const descriptions = {
    phishing: 'Attempts to steal sensitive information',
    malware: 'Contains or distributes malicious software',
    spam: 'Unsolicited bulk messages or content',
    cryptomining: 'Unauthorized use of system resources for cryptocurrency mining',
    scam: 'Fraudulent scheme to deceive users',
    malicious: 'Generally harmful or malicious content',
    adult: 'Adult or mature content',
    suspicious: 'Potentially harmful but not confirmed',
    ip: 'Known malicious IP address',
  };
  return descriptions[category] || category;
};

export default function OverviewFileView() {
  const settings = useSettingsContext();
  const [files, setFiles] = useState([]);
  const [urlToScan, setUrlToScan] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [domContent, setDomContent] = useState(null);
  const aStatRef = useRef(null);
  const [message, setMessage] = useState({ type: null, content: null });

  const resetAnalysisStatusMessage = () => {
    if (aStatRef.current) {
      aStatRef.current.textContent = '';
    }
  };

  const fetchFiles = useCallback(async () => {
    setMessage({ type: null, content: null });
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setMessage({ type: 'error', content: 'Failed to fetch files. Please try again.' });
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let areFilesFetched = false;

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      setMessage({ type: null, content: null });
      setIsLoading(true);
      resetAnalysisStatusMessage();
      try {
        const uploadPromises = acceptedFiles.map((file) => sendFile(file));
        await Promise.all(uploadPromises);
        fetchFiles();
        if (aStatRef.current) {
          aStatRef.current.textContent = 'Analysis is still in progress';
        }
        await wait(1000);
        while (!areFilesFetched) {
          await handleCheckAllAnalysis();
          await wait(2000);
        }
        aStatRef.current.textContent = 'Analysis Finished !';
        fetchFiles();
      } catch (err) {
        console.error('Error uploading file:', err);
        setMessage({ type: 'error', content: 'Failed to upload file. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFiles]
  );

  const handleCheckAllAnalysis = useCallback(async () => {
    try {
      const result = await checkAnalysisResult();
      await fetchFiles();
      areFilesFetched = result?.result || false;
    } catch (err) {
      console.error('Failed to check analysis results:', err);
    }
  }, [fetchFiles]);

  const handleUrlScan = async () => {
    setIsLoading(true);
    setMessage({ type: null, content: null });
    setScanResult(null);
    setScreenshotUrl(null);
    setDomContent(null);
    try {
      const result = await scanUrl(urlToScan);
      if (result.message === 'URL scanned successfully') {
        setScanResult(result.result);

        const isMalicious = result.result.verdicts.overall.malicious;
        const {score} = result.result.verdicts.overall;
        const {categories} = result.result.verdicts.overall;

        setMessage({
          type: isMalicious ? 'error' : 'success',
          content: isMalicious
            ? `The URL is potentially malicious. Score: ${score}. Categories: ${categories.join(', ')}`
            : `The URL appears to be safe. Score: ${score}`,
        });

        setScreenshotUrl(result.result.task.screenshotURL);
        // On peut aussi récupérer le DOM si nécessaire
        // setDomContent(result.result.data.dom);
      } else {
        throw new Error('Scan failed');
      }
    } catch (err) {
      console.error('Error scanning URL:', err);
      setMessage({ type: 'error', content: 'Failed to scan URL. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (fileId) => {
      setIsLoading(true);
      setMessage({ type: null, content: null });
      try {
        await deleteInScanResult(fileId);
        await fetchFiles();
        setMessage({ type: 'success', content: 'File deleted successfully' });
      } catch (err) {
        console.error('Error deleting file:', err);
        setMessage({ type: 'error', content: 'Failed to delete file. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFiles]
  );

  const handleDownload = useCallback(async (file) => {
    try {
      const blob = await pdf(<FileAnalysisDocument file={file} />).toBlob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      const fname = file.filename.split('.').slice(0, -1).join('.');
      link.download = `${fname}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error('Error downloading file:', err);
      setMessage({ type: 'error', content: 'Failed to download file. Please try again.' });
    }
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        File Analysis Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scan URL
                </Typography>
                <TextField
                  fullWidth
                  value={urlToScan}
                  onChange={(e) => setUrlToScan(e.target.value)}
                  placeholder="Enter URL to scan"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleUrlScan}
                  disabled={isLoading || !urlToScan}
                >
                  Scan URL
                </Button>
              </CardContent>
            </Card>

            {message.content && (
              <Alert severity={message.type} sx={{ mt: 2 }}>
                {message.content}
              </Alert>
            )}

            {scanResult && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Scan Results
                  </Typography>
                  <Typography>
                    Malicious: {scanResult.verdicts.overall.malicious ? 'Yes' : 'No'}
                  </Typography>
                  <Typography>Score: {scanResult.verdicts.overall.score}</Typography>
                  {scanResult.verdicts.overall.categories.length > 0 && (
                    <Typography>
                      Categories: {scanResult.verdicts.overall.categories.join(', ')}
                    </Typography>
                  )}
                  {scanResult.verdicts.overall.brands &&
                    scanResult.verdicts.overall.brands.length > 0 && (
                      <Typography>
                        Brands: {scanResult.verdicts.overall.brands.join(', ')}
                      </Typography>
                    )}
                </CardContent>
              </Card>
            )}

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

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}

            <Typography variant="h6">
              Analysis Status :{' '}
              <div className="analysisStatus">
                <p className="aStat" ref={aStatRef} />
              </div>
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
                      <IconButton aria-label="download" onClick={() => handleDownload(file)}>
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
          {screenshotUrl ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Site Screenshot
                </Typography>
                <img src={screenshotUrl} alt="Site Screenshot" style={{ width: '100%' }} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1">
                  No screenshot available. Scan a URL to see the site preview.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {domContent && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Site DOM
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{domContent}</pre>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
