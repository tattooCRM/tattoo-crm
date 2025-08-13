import { LayoutDashboard, CheckSquare, Calendar, Search, Plus, Tag, Users, Building, FileText, Mail, Share2, HelpCircle, Settings } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="flex flex-col justify-between w-64 h-screen bg-[#0D1B2A] text-white p-4">
            { /* Top Logo */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <LayoutDashboard size={20}/>
                    </div>
                    <h1 className="font-bold text-lg">InkFlow</h1>
                </div>

                { /*Menu Principal */}
                <nav className="space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard"/>
                    <SidebarItem icon={<CheckSquare size={18}/>} label="Tasks"/>
                    <SidebarItem icon={<Calendar size={18}/>} label="Calendar" badge="1"/>
                </nav>

                { /*Sales */}
                <SectionTitle title="Sales"/>
                <nav className="space-y-2">
                    <SidebarItem icon={<Search size={18}/>} label="Leads"/>
                    <SidebarItem icon={<Tag size={18}/>} label="Opportunities" active/>
                    <SidebarItem icon={<Users size={18}/>} label="Contacts"/>
                    <SidebarItem icon={<Building size={18}/>} label="Companies"/>
                </nav>

                { /*Marketing */}
                <SectionTitle title="Marketing"/>
                <nav className="space-y-2">
                    <SidebarItem icon={<FileText size={18}/>} label="Campaigns"/>
                    <SidebarItem icon={<Mail size={18}/>} label="Emails"/>
                    <SidebarItem icon={<Share2 size={18}/>} label="Social Media"/>
                    <SidebarItem icon={<HelpCircle size={18}/>} label="Support"/>
                </nav>

                { /*Bottom - Support & User */}
                <div>
                    <SidebarItem icon={<HelpCircle size={18}/>} label="Help & Support"/>
                    <SidebarItem icon={<Settings size={18}/>} label="Settings"/>

                    <div className="flex items-center gap-3 mt-4 p-2 hover:bg-[#1B263B] rounded-lg cursor-pointer">
                        <img src="https://u.pravatar.cc/40" alt="user" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-medium">John Marpaung</p>
                            <p className="text-xs text-gray-400">John@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SidebarItem({ icon, label, active, badge }) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[#1B263B] ${
        active ? "bg-[#1B263B]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

// Composant titre de section
function SectionTitle({ title }) {
  return <p className="mt-4 mb-2 text-xs uppercase text-gray-400">{title}</p>;
}