import React, { useState } from 'react';
import { TreeNode as TreeNodeType } from '../types';
import './TreeNode.css';

interface TreeNodeProps {
  node: TreeNodeType;
  level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 默认展开前两级

  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 20;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="tree-node" style={{ marginLeft: `${indent}px` }}>
      <div 
        className={`node-content ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={handleToggle}
      >
        {hasChildren && (
          <span className="expand-icon">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="expand-icon-placeholder"></span>}
        <span className="node-code">{node.code}</span>
        <span className="node-name">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="children-container">
          {node.children.map((child, index) => (
            <TreeNode key={`${child.code}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;

