'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';
import { sendFile, getFiles } from 'src/api/file';

import Iconify from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';

import FileUpgrade from '../../../file-manager/file-upgrade';
import FileStorageOverview from '../../../file-manager/file-storage-overview';
import FileManagerNewFolderDialog from '../../../file-manager/file-manager-new-folder-dialog';

const GB = 1000000000 * 24;

export default function OverviewFileView() {
  const theme = useTheme();
  const smDown = useResponsive('down', 'sm');
  const settings = useSettingsContext();
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState([]);
  const newFolder = useBoolean();
  const upload = useBoolean();
  const { user } = useAuthContext();
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fetchedFiles = await getFiles();
        setFiles(fetchedFiles.map(name => ({
          name,
          preview: '', // Pas de preview disponible
          size: 'Unknown',
          modifiedAt: new Date().toISOString(),
        })));
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  const handleCreateNewFolder = useCallback(() => {
    newFolder.onFalse();
    setFolderName('');
    console.info('CREATE NEW FOLDER');
  }, [newFolder]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const uploadPromises = acceptedFiles.map(file => sendFile(file));
        const responses = await Promise.all(uploadPromises);
        const newFiles = responses.map((response, index) => ({
          ...acceptedFiles[index],
          preview: URL.createObjectURL(acceptedFiles[index]),
          path: response.path,
        }));
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    },
    []
  );

  const handleDownload = useCallback((fileName) => {
    const userId = user.id;
    const fileUrl = `../../../../../public/data/${userId}/${fileName}`;
    console.log("aled",fileUrl);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [user]);
  

  const renderStorageOverview = (
    <FileStorageOverview total={GB} chart={{ series: 20 }} data={[]} />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={8}>
          <Typography sx={{ mb: 1, py: 2.5, width: 'auto', height: 'auto', color: 'black' }}>
            Upload file for scan :
          </Typography>
          <UploadBox
            onDrop={handleDrop}
            placeholder={
              <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Upload file for scan</Typography>
              </Stack>
            }
            sx={{ mb: 3, py: 2.5, width: 'auto', height: 'auto', borderRadius: 1.5 }}
          />

          <Stack spacing={0.5} alignItems="center">
            <Typography>Scan Result: {/* TO DO: RECUPERER LA REPONSE DU SCAN */}</Typography>
          </Stack>

          <div>
            <Typography sx={{ mb: 1, py: 2.5, width: 'auto', height: 'auto', color: 'black' }}>
              Recent files :
            </Typography>
            <Stack spacing={2}>
              {files.map((file, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="center">
                  <Typography sx={{ fontSize: 16, color: 'text.primary' }}>
                    {file.name}
                  </Typography>
                  <Button variant="outlined" onClick={() => handleDownload(file.name)}>
                    Download
                  </Button>
                </Stack>
              ))}
            </Stack>
          </div>
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{renderStorageOverview}</Box>
          <FileUpgrade sx={{ mt: 3 }} />
        </Grid>
      </Grid>
      <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />
      <FileManagerNewFolderDialog
        open={newFolder.value}
        onClose={newFolder.onFalse}
        title="New Folder"
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
        onCreate={handleCreateNewFolder}
      />
    </Container>
  );
}
