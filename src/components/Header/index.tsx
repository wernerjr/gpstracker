import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Logo, Nav, NavItem, MobileMenuButton, NavMenu } from './styles';

interface HeaderProps {
  unsyncedCount: number;
}

export function Header({ unsyncedCount }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container>
      <Logo>
        GPS Tracker<span>.</span>
      </Logo>
      
      <NavMenu isOpen={isOpen}>
        <Nav>
          <NavItem 
            active={location.pathname === '/'} 
            onClick={() => navigate('/')}
          >
            Tracker
          </NavItem>
          <NavItem 
            active={location.pathname === '/sync'}
            onClick={() => navigate('/sync')}
          >
            Sincronização {unsyncedCount > 0 && `(${unsyncedCount})`}
          </NavItem>
        </Nav>
      </NavMenu>

      <MobileMenuButton onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </MobileMenuButton>
    </Container>
  );
} 