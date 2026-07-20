import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/authContext'

const WarnedBanner = () => {
  const { warnedPending, dismissWarning, removedPending, dismissRemoval } = useAuth()

  const notification = removedPending
    ? { message: 'One of your posts was removed for violating our community guidelines.', onDismiss: dismissRemoval, style: 'removed' }
    : warnedPending
    ? { message: 'One of your posts was flagged by our moderation team. Please keep discussions respectful.', onDismiss: dismissWarning, style: 'warned' }
    : null

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className={`warned-banner warned-banner--${notification.style}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <span>{notification.message}</span>
          <button className="warned-banner-dismiss" onClick={notification.onDismiss}>Got it</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WarnedBanner
