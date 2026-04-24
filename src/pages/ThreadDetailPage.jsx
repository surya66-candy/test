import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Avatar, Chip, Divider,
  IconButton, Tooltip, TextField, alpha,
} from '@mui/material';
import {
  ArrowBack, PushPin, Lock, Edit, Delete, ThumbUp,
  ThumbDown, Reply, MoreVert,
} from '@mui/icons-material';
import useForumStore from '../store/forumStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const ThreadDetailPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { currentThread, fetchThread, replies, fetchReplies, addReply,
    deleteReply, voteReply, pinThread, lockThread, loading } = useForumStore();
  const { user, isClubAdmin } = useAuthStore();
  const [replyContent, setReplyContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchThread(threadId);
    fetchReplies(threadId);
  }, [threadId]);

  const canModerate = currentThread && isClubAdmin(currentThread.club_id);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    const result = await addReply(threadId, replyContent, replyTo);
    if (result.success) {
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply posted!');
    }
    setSubmitting(false);
  };

  const handleDelete = async (replyId) => {
    if (window.confirm('Delete this reply?')) {
      await deleteReply(replyId);
      toast.success('Reply deleted');
    }
  };

  if (!currentThread && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Thread not found</Typography>
        <Button onClick={() => navigate('/forum')} sx={{ mt: 2 }}>Back to Forum</Button>
      </Box>
    );
  }

  const buildReplyTree = (replies) => {
    const map = {};
    const roots = [];
    (replies || []).forEach((r) => { map[r.id] = { ...r, children: [] }; });
    (replies || []).forEach((r) => {
      if (r.parent_reply_id && map[r.parent_reply_id]) {
        map[r.parent_reply_id].children.push(map[r.id]);
      } else {
        roots.push(map[r.id]);
      }
    });
    return roots;
  };

  const ReplyItem = ({ reply, depth = 0 }) => (
    <Box sx={{ ml: depth * 4, mt: 1.5 }}>
      <Paper sx={{
        p: 2, borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        borderLeft: depth > 0 ? (t) => `3px solid ${alpha(t.palette.primary.main, 0.3)}` : undefined,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem',
            background: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.secondary.dark})` }}>
            {reply.author_name?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>{reply.author_name || 'Anonymous'}</Typography>
          <Typography variant="caption" color="text.secondary">{dayjs(reply.created_at).fromNow()}</Typography>
          <Box sx={{ flex: 1 }} />
          {(reply.author_id === user?.id || canModerate) && (
            <IconButton size="small" color="error" onClick={() => handleDelete(reply.id)}>
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{reply.content}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <IconButton size="small" onClick={() => voteReply(reply.id, 'up')}>
            <ThumbUp sx={{ fontSize: 16 }} />
          </IconButton>
          <Typography variant="caption" fontWeight={600}>{(reply.upvotes || 0) - (reply.downvotes || 0)}</Typography>
          <IconButton size="small" onClick={() => voteReply(reply.id, 'down')}>
            <ThumbDown sx={{ fontSize: 16 }} />
          </IconButton>
          <Button size="small" startIcon={<Reply sx={{ fontSize: 14 }} />}
            onClick={() => { setReplyTo(reply.id); }}
            sx={{ ml: 1, fontSize: '0.75rem' }}>
            Reply
          </Button>
        </Box>
      </Paper>
      {reply.children?.map((child) => (
        <ReplyItem key={child.id} reply={child} depth={depth + 1} />
      ))}
    </Box>
  );

  const replyTree = buildReplyTree(replies);

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/forum')} sx={{ mb: 2 }}>
        Back to Forum
      </Button>

      {currentThread && (
        <>
          {/* Thread Header */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {currentThread.is_pinned && <Chip icon={<PushPin sx={{ fontSize: 14 }} />} label="Pinned" size="small" color="primary" />}
              {currentThread.is_locked && <Chip icon={<Lock sx={{ fontSize: 14 }} />} label="Locked" size="small" color="warning" />}
              {currentThread.category && <Chip label={currentThread.category} size="small" />}
              {currentThread.tags?.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>{currentThread.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 40, height: 40,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})` }}>
                {currentThread.author_name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>{currentThread.author_name || 'Unknown'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted {dayjs(currentThread.created_at).fromNow()} · {currentThread.views_count || 0} views
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              {canModerate && (
                <>
                  <Tooltip title={currentThread.is_pinned ? 'Unpin' : 'Pin'}>
                    <IconButton onClick={() => pinThread(threadId)}><PushPin /></IconButton>
                  </Tooltip>
                  <Tooltip title={currentThread.is_locked ? 'Unlock' : 'Lock'}>
                    <IconButton onClick={() => lockThread(threadId)}><Lock /></IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {currentThread.content}
            </Typography>
          </Paper>

          {/* Replies */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {replies?.length || 0} Replies
          </Typography>

          {replyTree.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}

          {/* Reply Form */}
          {!currentThread.is_locked && (
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                {replyTo ? 'Replying to a comment...' : 'Write a Reply'}
                {replyTo && (
                  <Button size="small" onClick={() => setReplyTo(null)} sx={{ ml: 1 }}>Cancel</Button>
                )}
              </Typography>
              <TextField fullWidth multiline rows={4} placeholder="Share your thoughts..."
                value={replyContent} onChange={(e) => setReplyContent(e.target.value)} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </Box>
            </Paper>
          )}

          {currentThread.is_locked && (
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3, textAlign: 'center',
              border: (t) => `1px solid ${t.palette.divider}`,
              backgroundColor: (t) => alpha(t.palette.warning.main, 0.05) }}>
              <Lock sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography color="text.secondary">This thread is locked. No new replies can be added.</Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ThreadDetailPage;
