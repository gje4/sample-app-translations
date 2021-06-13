import { Box, ProgressCircle } from '@bigcommerce/big-design';
import React from 'react';
import styled from 'styled-components';

interface LoadingComponentProps {
  isLoading: boolean;
  children?: JSX.Element,
}

const StyledBox = styled(Box)`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
  z-index: 2;
`;

const Loading: React.FC<LoadingComponentProps> = ({ isLoading, children }) => {
  return isLoading ? (
    <StyledBox padding="xxxLarge">
      <ProgressCircle size="medium" />
    </StyledBox>
  ) : children;
};

export default Loading;
