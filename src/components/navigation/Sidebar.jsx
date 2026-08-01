import { navigationItems } from '../../data/navigationItems';
import SidebarItem from './SidebarItem';

function Sidebar({ activeSection, onSectionChange }) {
    return (
        <nav aria-label="Navigazione principale" className="space-y-1">
            {navigationItems.map((item) => (
                <SidebarItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                />
            ))}
        </nav>
    )
}

export default Sidebar;