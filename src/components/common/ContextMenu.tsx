import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  submenu?: MenuItem[];
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  triggerRef?: React.RefObject<HTMLElement>;
  items?: MenuItem[];
  children?: React.ReactNode;
  width?: number | string;
}

interface MenuDropdownProps {
  items?: MenuItem[];
  children?: React.ReactNode;
  position: { x: number; y: number };
  width?: number | string;
  onClose: () => void;
  isSubmenu?: boolean;
  onSubmenuEnter?: () => void;
  onSubmenuLeave?: () => void;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  items,
  children,
  position,
  width = 220,
  onClose,
  isSubmenu = false,
  onSubmenuEnter,
  onSubmenuLeave
}) => {
  const [activeSubmenuIndex, setActiveSubmenuIndex] = useState<number | null>(null);
  const [submenuPos, setSubmenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const openSubmenuForIndex = useCallback((index: number, immediate: boolean = false) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);

    const targetItem = items?.[index];
    if (!targetItem || targetItem.disabled || !targetItem.submenu || targetItem.submenu.length === 0) {
      if (immediate) {
        setActiveSubmenuIndex(null);
        setSubmenuPos(null);
      } else {
        openTimerRef.current = setTimeout(() => {
          setActiveSubmenuIndex(null);
          setSubmenuPos(null);
        }, 80);
      }
      return;
    }

    const computePos = () => {
      const btn = itemRefs.current[index];
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const subWidth = 240;
      const subHeight = (targetItem.submenu?.length || 0) * 32 + 10;

      // Prefer opening to the right with a 2px overlap for seamless mouse movement
      let x = rect.right - 2;
      if (x + subWidth > window.innerWidth - 8) {
        // Not enough room on the right, flip to the left
        x = Math.max(8, rect.left - subWidth + 2);
      }

      // Vertical placement: align top with parent row, clamped within viewport
      let y = rect.top - 4;
      if (y + subHeight > window.innerHeight - 8) {
        y = Math.max(8, window.innerHeight - subHeight - 8);
      }

      setActiveSubmenuIndex(index);
      setSubmenuPos({ x, y });
    };

    if (immediate) {
      computePos();
    } else {
      openTimerRef.current = setTimeout(computePos, 80);
    }
  }, [items]);

  const handleItemMouseEnter = (index: number) => {
    setHoveredIndex(index);
    openSubmenuForIndex(index, false);
  };

  const handleItemMouseLeave = (index: number) => {
    setHoveredIndex(null);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (activeSubmenuIndex === index) {
      closeTimerRef.current = setTimeout(() => {
        setActiveSubmenuIndex(null);
        setSubmenuPos(null);
      }, 250);
    }
  };

  const handleChildSubmenuEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (onSubmenuEnter) onSubmenuEnter();
  };

  const handleChildSubmenuLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveSubmenuIndex(null);
      setSubmenuPos(null);
    }, 250);
    if (onSubmenuLeave) onSubmenuLeave();
  };

  const hasAnyIcon = items?.some(it => !!it.icon);

  return (
    <>
      <div
        data-context-menu="true"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: isSubmenu ? 1510 : 1500,
          backgroundColor: '#252526',
          border: '1px solid #3e3e42',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          padding: '4px 0',
          minWidth: width,
          maxHeight: 'calc(100vh - 16px)',
          overflowY: 'auto',
          color: '#ffffff',
          userSelect: 'none'
        }}
        onClick={e => e.stopPropagation()}
        onMouseEnter={onSubmenuEnter}
        onMouseLeave={onSubmenuLeave}
      >
        {children ? (
          children
        ) : (
          items?.map((item, idx) => {
            const hasSub = Boolean(item.submenu && item.submenu.length > 0);
            const isSubOpen = activeSubmenuIndex === idx;
            const isHighlighted = (hoveredIndex === idx && !item.disabled) || isSubOpen;

            return (
              <button
                key={idx}
                ref={el => {
                  itemRefs.current[idx] = el;
                }}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  if (hasSub) {
                    if (isSubOpen) {
                      setActiveSubmenuIndex(null);
                      setSubmenuPos(null);
                    } else {
                      openSubmenuForIndex(idx, true);
                    }
                  } else if (item.onClick) {
                    item.onClick();
                    onClose();
                  }
                }}
                onMouseEnter={() => handleItemMouseEnter(idx)}
                onMouseLeave={() => handleItemMouseLeave(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: isHighlighted ? '#094771' : 'transparent',
                  border: 'none',
                  color: item.disabled ? '#777777' : '#ffffff',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  textAlign: 'left',
                  transition: 'background-color 60ms',
                  whiteSpace: 'nowrap'
                }}
              >
                {hasAnyIcon && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      flexShrink: 0
                    }}
                  >
                    {item.icon || null}
                  </span>
                )}
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                {hasSub && (
                  <ChevronRight
                    size={14}
                    style={{
                      marginLeft: 12,
                      opacity: item.disabled ? 0.3 : 0.7,
                      flexShrink: 0
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Render cascading child submenu */}
      {activeSubmenuIndex !== null && submenuPos && items?.[activeSubmenuIndex]?.submenu && (
        <MenuDropdown
          items={items[activeSubmenuIndex].submenu}
          position={submenuPos}
          width={width}
          onClose={onClose}
          isSubmenu={true}
          onSubmenuEnter={handleChildSubmenuEnter}
          onSubmenuLeave={handleChildSubmenuLeave}
        />
      )}
    </>
  );
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  onClose,
  position,
  triggerRef,
  items,
  children,
  width = 220
}) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest('[data-context-menu="true"]')) {
        return;
      }
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  let computedPosition = { x: 0, y: 0 };
  const menuWidth = typeof width === 'number' ? width : 220;

  if (position) {
    computedPosition = {
      x: Math.max(8, Math.min(position.x, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(position.y, window.innerHeight - 300))
    };
  } else if (triggerRef?.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    const left = rect.right + menuWidth > window.innerWidth ? rect.right - menuWidth : rect.left;
    const top = rect.bottom + 250 > window.innerHeight ? rect.top - 250 : rect.bottom + 4;
    computedPosition = {
      x: Math.max(8, left),
      y: Math.max(8, top)
    };
  }

  return (
    <MenuDropdown
      items={items}
      position={computedPosition}
      width={width}
      onClose={onClose}
    >
      {children}
    </MenuDropdown>
  );
};
