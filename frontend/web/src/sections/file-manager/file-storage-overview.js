import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';

// ----------------------------------------------------------------------

export default function FileStorageOverview({ data, total, ...other }) {
  const theme = useTheme();

  return (
    <Card {...other}>

      <Stack spacing={3} sx={{ px: 3, pb: 16, pt:16 }}>
        {data.map((category) => (
          <Stack key={category.name} spacing={2} direction="row" alignItems="center">
            <Box sx={{ width: 40, height: 40}}>{category.icon}</Box>

            <ListItemText
              primary={category.name}
              secondary={`${category.filesCount} files`}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
                color: 'text.disabled',
              }}
            />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

FileStorageOverview.propTypes = {
  data: PropTypes.array,
  total: PropTypes.number,
};
