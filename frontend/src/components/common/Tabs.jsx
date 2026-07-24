/**
 * Tabs - right-column tab switcher in Case Detail (Section 11.4).
 * @param {{tabs:{id:string,label:string,icon?:Function}[], activeTab:string, onChange:Function}} props
 */
export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border-subtle">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "border-accent-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {Icon && <Icon size={14} aria-hidden="true" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
