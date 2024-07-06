import Stack from '@mui/material/Stack';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useAuthContext();

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center" />
    </Stack>
  );
}
