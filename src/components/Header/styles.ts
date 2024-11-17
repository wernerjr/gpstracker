import styled from 'styled-components';
import { darkTheme } from '../../styles/global';

export const Container = styled.header`
  background-color: ${darkTheme.colors.surface};
  padding: ${darkTheme.spacing.padding};
  border-bottom: 1px solid ${darkTheme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  color: ${darkTheme.colors.text};
  font-size: 1.5rem;
  font-weight: bold;
  
  span {
    color: ${darkTheme.colors.primary};
  }
`;

export const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

export const NavItem = styled.a<{ active?: boolean }>`
  color: ${props => props.active ? darkTheme.colors.primary : darkTheme.colors.text};
  text-decoration: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
  }
`;

export const NavMenu = styled.div<{ isOpen: boolean }>`
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${darkTheme.colors.surface};
    padding: 1rem;
    border-bottom: 1px solid ${darkTheme.colors.border};
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  span {
    display: block;
    width: 25px;
    height: 2px;
    background-color: ${darkTheme.colors.text};
    transition: all 0.3s ease;
  }
`; 