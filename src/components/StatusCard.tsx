import { ReactNode } from 'react'

interface StatusCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'blue' | 'yellow' | 'red' | 'green'
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
}

export default function StatusCard({ title, value, icon, color }: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
