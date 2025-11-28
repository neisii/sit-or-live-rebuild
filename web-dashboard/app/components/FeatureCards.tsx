'use client';

export default function FeatureCards() {
  const features = [
    {
      icon: '☁️',
      title: 'Auto Theme Change',
      description: 'Themes change automatically based on your local weather',
    },
    {
      icon: '💪',
      title: 'Health Monitoring',
      description: 'Get reminders to move and rest your eyes',
    },
    {
      icon: '🎨',
      title: '7 Platforms',
      description: 'Kiro IDE, VS Code, iTerm2, Warp, Kitty, Hyper, Terminal',
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <div className="text-4xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-gray-400">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
