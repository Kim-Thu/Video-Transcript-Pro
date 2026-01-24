import React from 'react';
import { Card } from '../ui';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

export const FeatureCard = ({ icon, title, description, gradient, iconColor }: FeatureCardProps) => (
  <Card className="text-center group mb-6">
    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </Card>
);
