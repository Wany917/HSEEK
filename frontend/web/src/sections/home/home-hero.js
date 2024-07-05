import { m, useScroll } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, styled, useTheme } from '@mui/material/styles';

import { HEADER } from 'src/layouts/config-layout';
import { bgGradient, textGradient } from 'src/theme/css';
import { useResponsive } from 'src/hooks/use-responsive';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.94),
    imgUrl: '/mnt/data/image.png',
  }),
  width: '100%',
  height: '100vh',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const StyledTextGradient = styled(m.h1)(({ theme }) => ({
  ...textGradient(
    `300deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.main} 25%, ${theme.palette.primary.main} 50%, ${theme.palette.warning.main} 75%, ${theme.palette.primary.main} 100%`
  ),
  padding: 0,
  marginTop: 8,
  lineHeight: 1,
  fontWeight: 900,
  marginBottom: 24,
  letterSpacing: 8,
  backgroundSize: '400%',
  fontSize: `${64 / 16}rem`,
  fontFamily: theme.typography.fontSecondaryFamily,
  [theme.breakpoints.up('md')]: {
    fontSize: `${96 / 16}rem`,
  },
}));

const HomeHero = () => {
  const mdUp = useResponsive('up', 'md');

  const theme = useTheme();

  const heroRef = useRef(null);

  const { scrollY } = useScroll();

  const [percent, setPercent] = useState(0);

  const getScroll = useCallback(() => {
    let heroHeight = 0;

    if (heroRef.current) {
      heroHeight = heroRef.current.offsetHeight;
    }

    scrollY.on('change', (scrollHeight) => {
      const scrollPercent = (scrollHeight * 100) / heroHeight;

      setPercent(Math.floor(scrollPercent));
    });
  }, [scrollY]);

  useEffect(() => {
    getScroll();
  }, [getScroll]);

  const transition = {
    repeatType: 'loop',
    ease: 'linear',
    duration: 60 * 4,
    repeat: Infinity,
  };

  const opacity = 1 - percent / 100;

  const hide = percent > 120;

  const renderDescription = (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        height: 1,
        mx: 'auto',
        maxWidth: 480,
        opacity: opacity > 0 ? opacity : 0,
        mt: {
          md: `-${HEADER.H_DESKTOP + percent * 2.5}px`,
        },
      }}
    >
      <m.div variants={varFade().in}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
          }}
        >
          Be safer <br />
          with
        </Typography>
      </m.div>

      <m.div variants={varFade().in}>
        <StyledTextGradient
          animate={{ backgroundPosition: '200% center' }}
          transition={{
            repeatType: 'reverse',
            ease: 'linear',
            duration: 20,
            repeat: Infinity,
          }}
        >
          Hollowseek
        </StyledTextGradient>
      </m.div>

      <m.div variants={varFade().in}>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Keep your pc safe with our scanning and analyzing tool.
        </Typography>
      </m.div>
    </Stack>
  );

  return (
    <StyledRoot
      ref={heroRef}
      sx={{
        ...(hide && {
          opacity: 0,
        }),
      }}
    >
      <Container
        component={MotionContainer}
        sx={{ height: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid
          container
          columnSpacing={{ md: 10 }}
          sx={{ height: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Grid xs={12} md={6}>
            {renderDescription}
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  );
};

export default HomeHero;
