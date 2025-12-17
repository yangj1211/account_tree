import React, { useState, useEffect, useMemo } from 'react';
import { Tree, Input, Card, Typography, Segmented, Tabs, Button, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { TreeNode as TreeNodeType } from './types';
import accountTreeData from '../account_tree.json';
import './App.css';

const { Title } = Typography;
const { Search } = Input;

type SearchMode = 'parent' | 'child';
type DisplayMode = 'tree' | 'array' | 'list' | 'both';

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [originalTreeData, setOriginalTreeData] = useState<TreeNodeType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('parent');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('tree');

  // 按code字母顺序排序节点
  const sortNodesByCode = (nodes: TreeNodeType[]): TreeNodeType[] => {
    return [...nodes].sort((a, b) => {
      return a.code.localeCompare(b.code, 'zh-CN', { numeric: true });
    }).map(node => ({
      ...node,
      children: node.children && node.children.length > 0 
        ? sortNodesByCode(node.children) 
        : [],
    }));
  };

  // 将原始数据转换为 antd Tree 组件需要的格式
  const convertToTreeData = (nodes: TreeNodeType[]): DataNode[] => {
    return nodes.map((node, index) => {
      const key = `${node.code}-${index}`;
      return {
        title: (
          <span>
            <span style={{ fontWeight: 500, color: '#1890ff', marginRight: 8 }}>
              {node.code}
            </span>
            <span>{node.name}</span>
          </span>
        ),
        key,
        children: node.children && node.children.length > 0 
          ? convertToTreeData(node.children) 
          : undefined,
      };
    });
  };

  // 获取默认展开的节点（前两级）
  const getDefaultExpandedKeys = (nodes: DataNode[], level: number = 0, maxLevel: number = 2): React.Key[] => {
    const keys: React.Key[] = [];
    if (level >= maxLevel) return keys;
    
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key);
        keys.push(...getDefaultExpandedKeys(node.children, level + 1, maxLevel));
      }
    });
    return keys;
  };

  useEffect(() => {
    // 先对原始数据进行排序，然后转换为Tree格式
    const sortedData = sortNodesByCode(accountTreeData as TreeNodeType[]);
    setOriginalTreeData(sortedData);
    const convertedData = convertToTreeData(sortedData);
    setTreeData(convertedData);
    setExpandedKeys(getDefaultExpandedKeys(convertedData));
  }, []);

  // 从React元素中提取文本内容
  const extractTextFromTitle = (title: React.ReactNode | ((data: DataNode) => React.ReactNode)): string => {
    if (typeof title === 'function') {
      // 如果是函数，返回空字符串（实际使用时不会调用函数）
      return '';
    }
    if (typeof title === 'string') return title;
    if (typeof title === 'number') return String(title);
    if (!title) return '';
    
    if (React.isValidElement(title)) {
      const children = (title.props as any)?.children;
      if (Array.isArray(children)) {
        return children.map((c: any) => extractTextFromTitle(c)).join('');
      }
      return extractTextFromTitle(children);
    }
    return '';
  };

  // 获取节点的所有子节点keys（递归）
  const getAllDescendantKeys = (node: DataNode): React.Key[] => {
    const keys: React.Key[] = [];
    if (node.children) {
      node.children.forEach(child => {
        keys.push(child.key);
        keys.push(...getAllDescendantKeys(child));
      });
    }
    return keys;
  };

  // 在树中查找节点及其路径
  const findNodePath = (nodes: DataNode[], targetKey: React.Key, path: DataNode[] = []): DataNode[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node];
      if (node.key === targetKey) {
        return currentPath;
      }
      if (node.children) {
        const found = findNodePath(node.children, targetKey, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  // 模式1：父节点搜索 - 显示匹配的父节点及其所有子节点
  const searchByParent = (nodes: DataNode[], term: string): DataNode[] => {
    if (!term) return nodes;

    return nodes
      .map(node => {
        const titleStr = extractTextFromTitle(node.title);
        const matchesSearch = titleStr.toLowerCase().includes(term.toLowerCase());
        
        // 如果匹配，返回该节点及其所有子节点
        if (matchesSearch) {
          return {
            ...node,
            children: node.children ? [...node.children] : undefined,
          };
        }
        
        // 递归搜索子节点
        const filteredChildren = node.children ? searchByParent(node.children, term) : [];
        if (filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((node) => node !== null) as DataNode[];
  };

  // 模式2：子节点搜索 - 显示匹配的子节点及其所有父节点路径
  const searchByChildImproved = (nodes: DataNode[], term: string): DataNode[] => {
    if (!term) return nodes;

    const matchedNodes: DataNode[] = [];
    
    // 先找到所有匹配的节点
    const findMatchingNodes = (nodeList: DataNode[]): void => {
      nodeList.forEach(node => {
        const titleStr = extractTextFromTitle(node.title);
        if (titleStr.toLowerCase().includes(term.toLowerCase())) {
          matchedNodes.push(node);
        }
        if (node.children) {
          findMatchingNodes(node.children);
        }
      });
    };

    findMatchingNodes(nodes);

    if (matchedNodes.length === 0) return [];

    // 为每个匹配的节点构建从根到该节点的路径树
    const buildPathTree = (path: DataNode[]): DataNode => {
      if (path.length === 1) {
        return { ...path[0] };
      }
      
      // 从最后一个节点开始，向前构建
      let currentNode: DataNode = { ...path[path.length - 1] };
      
      for (let i = path.length - 2; i >= 0; i--) {
        currentNode = {
          ...path[i],
          children: [currentNode],
        };
      }
      
      return currentNode;
    };

    // 合并多个路径树，避免重复的根节点
    const rootNodesMap = new Map<React.Key, DataNode>();
    
    matchedNodes.forEach(matchedNode => {
      const path = findNodePath(nodes, matchedNode.key);
      if (path && path.length > 0) {
        const pathTree = buildPathTree(path);
        const rootKey = pathTree.key;
        
        if (!rootNodesMap.has(rootKey)) {
          rootNodesMap.set(rootKey, pathTree);
        } else {
          // 如果根节点已存在，需要合并子节点
          const existingRoot = rootNodesMap.get(rootKey)!;
          const mergeTrees = (existing: DataNode, newTree: DataNode): DataNode => {
            if (!existing.children) {
              existing.children = [];
            }
            if (!newTree.children) {
              newTree.children = [];
            }
            
            // 合并子节点
            const childrenMap = new Map<React.Key, DataNode>();
            existing.children.forEach(child => {
              childrenMap.set(child.key, child);
            });
            
            newTree.children.forEach(newChild => {
              if (childrenMap.has(newChild.key)) {
                // 如果子节点已存在，递归合并
                childrenMap.set(newChild.key, mergeTrees(childrenMap.get(newChild.key)!, newChild));
              } else {
                childrenMap.set(newChild.key, newChild);
              }
            });
            
            return {
              ...existing,
              children: Array.from(childrenMap.values()),
            };
          };
          
          rootNodesMap.set(rootKey, mergeTrees(existingRoot, pathTree));
        }
      }
    });

    return Array.from(rootNodesMap.values());
  };

  // 搜索过滤树节点
  const filterTree = (nodes: DataNode[], term: string): DataNode[] => {
    if (!term) return nodes;
    
    if (searchMode === 'parent') {
      return searchByParent(nodes, term);
    } else {
      return searchByChildImproved(nodes, term);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return treeData;
    return filterTree(treeData, searchTerm);
  }, [searchTerm, treeData, searchMode]);

  // 将树结构扁平化为数组，只包含 code（编码）和 name（描述）
  const flattenTreeToArray = (nodes: DataNode[]): Array<{ code: string; name: string }> => {
    const result: Array<{ code: string; name: string }> = [];
    
    // 创建一个映射，从 key 找到对应的原始数据
    // key 的生成方式与 convertToTreeData 中一致：`${node.code}-${index}`
    const keyToOriginalMap = new Map<string, { code: string; name: string }>();
    
    const buildKeyMap = (nodeList: TreeNodeType[]) => {
      nodeList.forEach((node, index) => {
        const key = `${node.code}-${index}`;
        keyToOriginalMap.set(key, { code: node.code, name: node.name });
        if (node.children && node.children.length > 0) {
          buildKeyMap(node.children);
        }
      });
    };
    
    buildKeyMap(originalTreeData);
    
    // 遍历 DataNode，从映射中获取原始数据
    const traverse = (nodeList: DataNode[]) => {
      nodeList.forEach(node => {
        const original = keyToOriginalMap.get(String(node.key));
        if (original) {
          result.push({
            code: original.code, // 编码
            name: original.name, // 描述
          });
        }
        
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    
    traverse(nodes);
    return result;
  };

  // 获取数组格式的数据
  const arrayData = useMemo(() => {
    return flattenTreeToArray(filteredData);
  }, [filteredData]);

  // 获取只包含 code 的列表字符串，格式：{code1,code2,code3}
  const codeListString = useMemo(() => {
    const codes = arrayData.map(item => item.code);
    return `{${codes.join(',')}}`;
  }, [arrayData]);

  // 复制数组数据到剪贴板
  const copyArrayToClipboard = () => {
    const jsonString = JSON.stringify(arrayData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      message.success(`已复制 ${arrayData.length} 项数据到剪贴板`);
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 复制 code 列表到剪贴板
  const copyCodeListToClipboard = () => {
    navigator.clipboard.writeText(codeListString).then(() => {
      message.success(`已复制 ${arrayData.length} 个 code 到剪贴板`);
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value) {
      // 搜索时展开所有匹配的节点
      const filtered = filterTree(treeData, value);
      const getAllKeys = (nodes: DataNode[]): React.Key[] => {
        const keys: React.Key[] = [];
        nodes.forEach(node => {
          keys.push(node.key);
          if (node.children) {
            keys.push(...getAllKeys(node.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getAllKeys(filtered));
    } else {
      // 清空搜索时恢复默认展开
      setExpandedKeys(getDefaultExpandedKeys(treeData));
    }
  };

  return (
    <div className="app">
      <Card style={{ margin: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>
          合并科目结构树查看器
        </Title>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Segmented
            options={[
              { label: '父节点搜索（显示所有子节点）', value: 'parent' },
              { label: '子节点搜索（显示所有父节点）', value: 'child' },
            ]}
            value={searchMode}
            onChange={(value) => {
              setSearchMode(value as SearchMode);
              if (searchTerm) {
                // 切换模式时重新搜索
                handleSearch(searchTerm);
              }
            }}
            size="large"
          />
        </div>
        <Search
          placeholder={searchMode === 'parent' ? '输入父节点代码或名称，显示所有子节点...' : '输入子节点代码或名称，显示所有父节点路径...'}
          allowClear
          size="large"
          style={{ marginBottom: 16 }}
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              setSearchTerm('');
              setExpandedKeys(getDefaultExpandedKeys(treeData));
            }
          }}
        />
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Segmented
            options={[
              { label: '树视图', value: 'tree' },
              { label: '数组视图', value: 'array' },
              { label: '列表视图', value: 'list' },
              { label: '全部显示', value: 'both' },
            ]}
            value={displayMode}
            onChange={(value) => setDisplayMode(value as DisplayMode)}
          />
          {displayMode === 'array' && arrayData.length > 0 && (
            <Button onClick={copyArrayToClipboard} type="primary">
              复制数组到剪贴板
            </Button>
          )}
          {displayMode === 'list' && arrayData.length > 0 && (
            <Button onClick={copyCodeListToClipboard} type="primary">
              复制列表到剪贴板
            </Button>
          )}
        </div>
        {displayMode === 'both' ? (
          <Tabs
            defaultActiveKey="tree"
            items={[
              {
                key: 'tree',
                label: '树结构',
                children: (
                  <div className="tree-container">
                    {filteredData.length > 0 ? (
                      <Tree
                        showLine={{ showLeafIcon: false }}
                        showIcon={false}
                        defaultExpandAll={false}
                        expandedKeys={expandedKeys}
                        onExpand={setExpandedKeys}
                        treeData={filteredData}
                        style={{ background: '#fff' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        没有找到匹配的结果
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'array',
                label: `数组格式 (${arrayData.length} 项)`,
                children: (
                  <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '600px', overflow: 'auto' }}>
                    {arrayData.length > 0 ? (
                      <pre style={{ margin: 0, fontSize: '12px', lineHeight: '1.6' }}>
                        {JSON.stringify(arrayData, null, 2)}
                      </pre>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        没有找到匹配的结果
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'list',
                label: `列表格式 (${arrayData.length} 项)`,
                children: (
                  <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '600px', overflow: 'auto' }}>
                    {arrayData.length > 0 ? (
                      <div style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {codeListString}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        没有找到匹配的结果
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <>
            {displayMode === 'tree' && (
              <div className="tree-container">
                {filteredData.length > 0 ? (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    defaultExpandAll={false}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    treeData={filteredData}
                    style={{ background: '#fff' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    没有找到匹配的结果
                  </div>
                )}
              </div>
            )}
            {displayMode === 'array' && (
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '600px', overflow: 'auto' }}>
                {arrayData.length > 0 ? (
                  <pre style={{ margin: 0, fontSize: '12px', lineHeight: '1.6' }}>
                    {JSON.stringify(arrayData, null, 2)}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    没有找到匹配的结果
                  </div>
                )}
              </div>
            )}
            {displayMode === 'list' && (
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '600px', overflow: 'auto' }}>
                {arrayData.length > 0 ? (
                  <div style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {codeListString}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    没有找到匹配的结果
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default App;

