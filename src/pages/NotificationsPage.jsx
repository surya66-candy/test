import { useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItemButton, ListItemText,
  ListItemAvatar, Avatar, Button, Chip, Divider, alpha,
} from '@mui/material';
import {
  Notifications as NotifIcon, Forum, People, EmojiEvents,
  MarkEmailRead, DoneAll,
} from '@mui/icons-material';
import useNotificationStore from '../store/notificationStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const typeIcons = {
  reply: <Forum sx={{ fontSize: 20 }} />,
  mention: <People sx={{ fontSize: 20 }} />,
  member: <People sx={{ fontSize: 20 }} />,
  achievement: <EmojiEvents sx={{ fontSize: 20 }} />,
};

const typeColors = {
  reply: '#6C63FF',
  mention: '#F472B6',
  member: '#34D399',
  achievement: '#FBBF24',
};

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button startIcon={<DoneAll />} onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, overflow: 'hidden' }}>
        {notifications && notifications.length > 0 ? (
          <List disablePadding>
            {notifications.map((notif, i) => (
              <Box key={notif.id}>
                <ListItemButton
                  onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                  sx={{
                    py: 2, px: 3,
                    backgroundColor: notif.is_read ? 'transparent' : (t) => alpha(t.palette.primary.main, 0.04),
                    '&:hover': { backgroundColor: (t) => alpha(t.palette.primary.main, 0.08) },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      width: 40, height: 40,
                      background: `linear-gradient(135deg, ${typeColors[notif.type] || '#6C63FF'}, ${alpha(typeColors[notif.type] || '#6C63FF', 0.6)})`,
                    }}>
                      {typeIcons[notif.type] || <NotifIcon sx={{ fontSize: 20 }} />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notif.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(notif.created_at).fromNow()}
                        </Typography>
                        {!notif.is_read && (
                          <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      fontWeight: notif.is_read ? 400 : 600,
                      fontSize: '0.9rem',
                    }}
                  />
                </ListItemButton>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <NotifIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">No notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              You&apos;ll see notifications here when there&apos;s activity
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
