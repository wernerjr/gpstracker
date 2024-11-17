import styled from 'styled-components';

export const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  
  span {
    color: #2563eb;
  }
`;

export const NavMenu = styled.div<{ isOpen: boolean }>`
  @media (max-width: 768px) {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-100%)'};
    opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
    visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const NavItem = styled.a<{ active?: boolean }>`
  color: ${({ active }) => active ? '#2563eb' : '#64748b'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${({ active }) => active ? '100%' : '0'};
    height: 2px;
    background: #2563eb;
    transition: width 0.2s ease;
  }

  &:hover {
    color: #2563eb;
    
    &:after {
      width: 100%;
    }
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  span {
    width: 2rem;
    height: 0.25rem;
    background: #333;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`; 