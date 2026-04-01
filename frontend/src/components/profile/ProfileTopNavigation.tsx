/* eslint-disable max-lines, complexity */
import React, { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  AppBar,
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FiberManualRecord as DotIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import type { BrandingPack } from '../../branding/types';

export interface ProfileNavSubItem {
  id: string;
  label: string;
}

export interface ProfileNavMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: ProfileNavSubItem[];
}

interface ProfileTopNavigationProps {
  drawerOpen: boolean;
  activeView: string;
  pageTitle: string;
  unreadCount: number;
  menuItems: ProfileNavMenuItem[];
  profileName?: string;
  isCircusMode: boolean;
  brandingPack: BrandingPack;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onSelectView: (viewId: string) => void;
}

// eslint-disable-next-line complexity, max-lines-per-function
const ProfileTopNavigation: React.FC<ProfileTopNavigationProps> = ({
  drawerOpen,
  activeView,
  pageTitle,
  unreadCount,
  menuItems,
  profileName,
  isCircusMode,
  brandingPack,
  onOpenDrawer,
  onCloseDrawer,
  onSelectView,
}) => {
  const parentWithActiveChild = useMemo(
    () => menuItems.find((item) => item.children?.some((child) => child.id === activeView))?.id,
    [activeView, menuItems]
  );

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!parentWithActiveChild) {
      return;
    }
    setExpandedSections((previous) => ({ ...previous, [parentWithActiveChild]: true }));
  }, [parentWithActiveChild]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={
          isCircusMode
            ? {
                backgroundColor: 'rgba(28, 12, 12, 0.9)',
                borderBottom: '2px solid',
                borderColor: alpha('#d8b87a', 0.72),
                boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
                backdropFilter: 'blur(6px)',
              }
            : undefined
        }
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onOpenDrawer}
            sx={
              isCircusMode
                ? {
                    border: '1px solid',
                    borderColor: alpha('#d8b87a', 0.5),
                    mr: 1,
                  }
                : undefined
            }
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: isCircusMode ? brandingPack.typography.heading : undefined,
              color: isCircusMode ? '#f4ead6' : undefined,
            }}
          >
            {pageTitle}
          </Typography>
          {unreadCount > 0 && activeView !== 'news' && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: isCircusMode ? alpha('#b13a2f', 0.85) : 'error.main',
                color: '#fff',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
                border: isCircusMode ? '1px solid' : 'none',
                borderColor: isCircusMode ? alpha('#f2b9a2', 0.65) : 'transparent',
              }}
            >
              {unreadCount} neue
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={onCloseDrawer}
        PaperProps={{
          sx: isCircusMode
            ? {
                width: 268,
                background:
                  'linear-gradient(180deg, rgba(43,24,15,0.98) 0%, rgba(26,11,18,0.98) 100%)',
                borderRight: '2px solid',
                borderColor: alpha('#d8b87a', 0.65),
                color: '#f4ead6',
              }
            : { width: 250 },
        }}
      >
        <Box sx={{ width: '100%', pt: 2 }}>
          <Typography
            variant="h6"
            sx={{
              px: 2,
              mb: 2,
              fontWeight: 'bold',
              fontFamily: isCircusMode ? brandingPack.typography.display : undefined,
              color: isCircusMode ? '#ead7b2' : undefined,
            }}
          >
            Wiesenwahn Festival
          </Typography>

          {profileName && (
            <Typography
              variant="caption"
              sx={{
                px: 2,
                display: 'block',
                mb: 2,
                color: isCircusMode ? alpha('#e5cf9f', 0.95) : 'text.secondary',
                fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
              }}
            >
              {profileName}
            </Typography>
          )}

          <List>
            {menuItems.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isChildActive = Boolean(
                item.children?.some((child) => child.id === activeView)
              );

              if (!hasChildren) {
                return (
                  <ListItemButton
                    key={item.id}
                    selected={activeView === item.id}
                    onClick={() => onSelectView(item.id)}
                    sx={
                      isCircusMode
                        ? {
                            mx: 1,
                            mb: 0.5,
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor:
                              activeView === item.id
                                ? alpha('#d8b87a', 0.72)
                                : alpha('#d8b87a', 0.22),
                            backgroundColor:
                              activeView === item.id
                                ? alpha('#704214', 0.55)
                                : alpha('#2a120f', 0.5),
                            '&:hover': {
                              backgroundColor: alpha('#704214', 0.65),
                            },
                          }
                        : undefined
                    }
                  >
                    <ListItemIcon
                      sx={{
                        color: isCircusMode ? '#d8b87a' : undefined,
                        minWidth: 38,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        sx: {
                          fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
                          color: isCircusMode ? '#f4ead6' : undefined,
                        },
                      }}
                    />
                    {item.id === 'news' && unreadCount > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: isCircusMode ? alpha('#b13a2f', 0.85) : 'error.main',
                          color: '#fff',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                        }}
                      >
                        {unreadCount}
                      </Typography>
                    )}
                  </ListItemButton>
                );
              }

              const expanded = expandedSections[item.id] ?? isChildActive;
              return (
                <Box key={item.id}>
                  <ListItemButton
                    selected={isChildActive}
                    onClick={() => toggleSection(item.id)}
                    sx={
                      isCircusMode
                        ? {
                            mx: 1,
                            mb: 0.5,
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: isChildActive
                              ? alpha('#d8b87a', 0.72)
                              : alpha('#d8b87a', 0.22),
                            backgroundColor: isChildActive
                              ? alpha('#704214', 0.55)
                              : alpha('#2a120f', 0.5),
                          }
                        : undefined
                    }
                  >
                    <ListItemIcon
                      sx={{
                        color: isCircusMode ? '#d8b87a' : undefined,
                        minWidth: 38,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        sx: {
                          fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
                          color: isCircusMode ? '#f4ead6' : undefined,
                        },
                      }}
                    />
                    {expanded ? (
                      <ExpandLessIcon sx={{ color: isCircusMode ? '#d8b87a' : undefined }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: isCircusMode ? '#d8b87a' : undefined }} />
                    )}
                  </ListItemButton>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ pl: 2, pr: 1 }}>
                      {item.children?.map((child) => (
                        <ListItemButton
                          key={child.id}
                          selected={activeView === child.id}
                          onClick={() => onSelectView(child.id)}
                          sx={
                            isCircusMode
                              ? {
                                  mb: 0.5,
                                  borderRadius: '8px',
                                  border: '1px solid',
                                  borderColor:
                                    activeView === child.id
                                      ? alpha('#d8b87a', 0.72)
                                      : alpha('#d8b87a', 0.18),
                                  backgroundColor:
                                    activeView === child.id
                                      ? alpha('#704214', 0.45)
                                      : alpha('#1f0c0a', 0.45),
                                }
                              : { pl: 2 }
                          }
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 24,
                              color: isCircusMode ? alpha('#d8b87a', 0.9) : undefined,
                            }}
                          >
                            <DotIcon sx={{ fontSize: '0.55rem' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              sx: {
                                fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
                                fontSize: '0.92rem',
                                color: isCircusMode ? '#f4ead6' : undefined,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default ProfileTopNavigation;
