import React from 'react';
import { 
  Bell, X, Check, Trash2, AlertCircle, Clock, CheckCircle2, 
  Volume2, Calendar, Sparkles 
} from 'lucide-react';
import type { NotificationItem } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onTriggerTestAlert?: () => void;
  seniorMode?: boolean;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onDelete,
  onClearAll,
  onTriggerTestAlert,
  seniorMode = false,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'token_alert':
        return <Bell className="h-5 w-5 text-amber-400" />;
      case 'delay_alert':
        return <Clock className="h-5 w-5 text-rose-400" />;
      case 'booking_confirm':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'reschedule':
        return <Calendar className="h-5 w-5 text-cyan-400" />;
      case 'cancellation':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-indigo-400" />;
    }
  };

  const getBadgeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'token_alert':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'delay_alert':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'booking_confirm':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'reschedule':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'cancellation':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden ${
          seniorMode ? 'text-base' : 'text-sm'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Notifications & Alerts</span>
                <span className="text-xs font-normal text-slate-400">• హెచ్చరికలు</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live queue updates, doctor delays, and booking confirmations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Total: <strong className="text-slate-200">{notifications.length}</strong> | Unread: <strong className="text-amber-400">{unreadCount}</strong>
          </span>
          <div className="flex items-center gap-2">
            {onTriggerTestAlert && (
              <button
                onClick={onTriggerTestAlert}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                title="Trigger simulated 2 tokens away audio chime"
              >
                <Volume2 className="h-3 w-3" />
                <span>Simulate Token Alert</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-[11px] transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <div className="h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="h-6 w-6" />
              </div>
              <p className="font-medium text-slate-300">No active notifications</p>
              <p className="text-xs text-slate-500">
                You will receive proximity alerts when you are 2 tokens away, doctor schedule delays, and appointment confirmations here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                  item.is_read
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-80'
                    : 'bg-slate-800/70 border-slate-700 ring-1 ring-amber-500/20 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getBadgeStyle(item.type)}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <h4 className={`font-semibold truncate ${item.is_read ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 ml-auto">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className={`text-xs ${item.is_read ? 'text-slate-400' : 'text-slate-200'} leading-relaxed whitespace-pre-line`}>
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-start ml-2">
                  {!item.is_read && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            Audio chime sounds automatically when you are 2 tokens away
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
