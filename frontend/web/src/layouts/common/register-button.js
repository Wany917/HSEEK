import PropTypes from 'prop-types';

import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function RegisterButton({ sx }) {
  return (
    <Button component={RouterLink} href={paths.auth.jwt.register} variant="outlined" sx={{ mr: 1, ...sx }}>
      Register
    </Button>
  );
}

RegisterButton.propTypes = {
  sx: PropTypes.object,
};
