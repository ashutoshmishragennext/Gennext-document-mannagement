import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const openFolder = keyframes`
  0% {
    transform: perspective(300px) rotateX(0);
  }
  50% {
    transform: perspective(300px) rotateX(-30deg);
  }
  100% {
    transform: perspective(300px) rotateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// Styled components
const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 20px;
`;

const Folder = styled.div`
  width: 120px;
  height: 80px;
  background: linear-gradient(135deg, #6a8cff, #a37eff);
  border-radius: 5px 5px 0 0;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: ${openFolder} 2s infinite ease-in-out;
  transform-style: preserve-3d;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 10px;
    width: 40px;
    height: 10px;
    background: linear-gradient(135deg, #6a8cff, #a37eff);
    border-radius: 5px 5px 0 0;
  }
`;

const File = styled.div<{ delay: number }>`
  width: 60px;
  height: 80px;
  background: white;
  border-radius: 3px;
  position: absolute;
  bottom: -30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: ${bounce} 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
  transform-origin: bottom;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 15px;
    background: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const LoadingText = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #555;
  font-size: 18px;
  font-weight: 500;
  animation: ${float} 2s infinite ease-in-out;
`;

const Dot = styled.span<{ delay: number }>`
  opacity: 0;
  animation: fade 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;

  @keyframes fade {
    0%, 100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }
`;

const FilesContainer = styled.div`
  position: relative;
  width: 200px;
  height: 120px;
  display: flex;
  justify-content: center;
`;

// Component
const FolderLoader: React.FC<{ text?: string }> = ({ text = 'Loading your files' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <LoaderContainer>
      <FilesContainer>
        <Folder />
        <File delay={0} style={{ left: '20px', zIndex: 3 }} />
        <File delay={0.2} style={{ left: '50px', zIndex: 2 }} />
        <File delay={0.4} style={{ left: '80px', zIndex: 1 }} />
      </FilesContainer>
      <LoadingText>
        {text}
        <Dot delay={0}>.</Dot>
        <Dot delay={0.2}>.</Dot>
        <Dot delay={0.4}>.</Dot>
      </LoadingText>
    </LoaderContainer>
  );
};

export default FolderLoader;