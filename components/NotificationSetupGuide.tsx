'use client';

import { useState } from 'react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';

export function NotificationSetupGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSamsung, setIsSamsung] = useState(false);

  useState(() => {
    // Detect Samsung device
    const ua = navigator.userAgent.toLowerCase();
    setIsSamsung(ua.includes('samsung') || ua.includes('sm-'));
  });

  if (!isSamsung) return null;

  return (
    <div className="surface-soft border border-surface-border rounded-xl p-4 space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-accent-strong" />
          <div>
            <h3 className="font-medium">Not getting instant notifications?</h3>
            <p className="text-sm text-neutral-400">Tap for Samsung setup tips</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="space-y-3 text-sm text-neutral-300 pl-8">
          <p className="text-neutral-400">
            Samsung devices may delay notifications to save battery. Follow these steps for instant delivery:
          </p>
          
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              <strong>Settings → Apps → Chrome → Notifications</strong>
              <br />
              <span className="text-neutral-400 ml-5">
                Find &ldquo;www.shalmon.space&rdquo; and set to <strong>&ldquo;Alerting&rdquo;</strong> with <strong>&ldquo;High&rdquo;</strong> importance
              </span>
            </li>
            <li>
              <strong>Settings → Battery → Background usage limits</strong>
              <br />
              <span className="text-neutral-400 ml-5">
                Add Chrome to <strong>&ldquo;Never sleeping apps&rdquo;</strong>
              </span>
            </li>
            <li>
              <strong>Settings → Notifications → Advanced</strong>
              <br />
              <span className="text-neutral-400 ml-5">
                Enable <strong>&ldquo;Show as pop-up&rdquo;</strong> for Chrome notifications
              </span>
            </li>
          </ol>

          <p className="text-accent-strong">
            💡 After making these changes, test by having your partner send you a notification while this app is closed.
          </p>
        </div>
      )}
    </div>
  );
}
