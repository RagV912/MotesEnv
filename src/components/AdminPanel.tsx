import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, KeyRound, Copy, Check, Lock, Unlock, 
  Settings, Users, Server, Activity, LogOut, Clock, Search, Filter, 
  ChevronRight, ChevronDown, RefreshCw, Send, CheckCircle2, AlertTriangle, AlertCircle, Trash2, Edit2, X, Eye,
  Briefcase, Plus, Image, FolderOpen, Upload, Folder, HardDrive, FileImage, GripVertical,
  Smartphone, QrCode, Unlink
} from 'lucide-react';
import { InquiryTicket, Project, RegisteredAuthenticator } from '../types';
import { PROJECTS_DATA, getProjectImageDefault, INITIAL_MEDIA_FOLDER_IMAGES, getFolderKeyForProject } from '../data';
import { DEFAULT_ADMIN_CREDENTIALS } from '../adminCredentials';
import { sendSecurityNotificationEmail, COMPANY_SECURITY_EMAIL } from '../emailService';

// Standard RFC 4648 Base32 Decoding algorithm for Google Authenticator secret key
function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const len = cleaned.length;
  const out = new Uint8Array(Math.floor((len * 5) / 8));
  let bits = 0;
  let val = 0;
  let index = 0;
  for (let i = 0; i < len; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out[index++] = (val >> bits) & 0xff;
    }
  }
  return out;
}

// Full standard-compliant Time-based One-Time Password (TOTP) generator matching Google Authenticator
async function generateTOTP(secretBase32: string, counterOffset: number = 0): Promise<string> {
  try {
    const keyBytes = base32Decode(secretBase32);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStepSeconds = 30;
    const counter = Math.floor(epoch / timeStepSeconds) + counterOffset;

    // Convert counter to 8-byte big-endian buffer
    const counterBuffer = new ArrayBuffer(8);
    const dataView = new DataView(counterBuffer);
    const high = Math.floor(counter / 0x100000000);
    const low = counter % 0x100000000;
    dataView.setUint32(0, high, false);
    dataView.setUint32(4, low, false);

    // Import the raw Base32 decoded key into Web Crypto subtle API
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    // Sign the counter
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      counterBuffer
    );

    const hmacBytes = new Uint8Array(signature);
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;

    // Retrieve the 4-byte dynamic binary code
    const codeBinary =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);

    const otp = codeBinary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return '000000';
  }
}

// Generates a randomized cryptographically secure 16-character Base32 secret
function generateRandomSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars[array[i] % 32];
  }
  return result;
}

// Encrypt text with a password using PBKDF2 + AES-GCM for secure backups
async function encryptData(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(text)
  );
  
  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  // Convert to Base64
  let binary = "";
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

// Decrypt text with a password using PBKDF2 + AES-GCM
async function decryptData(base64: string, password: string): Promise<string> {
  const binary = atob(base64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  
  const enc = new TextEncoder();
  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

interface FolderTreeNode {
  name: string;
  fullName: string;
  isLeaf: boolean;
  imageCount: number;
  children: Record<string, FolderTreeNode>;
}

interface TreeRow {
  id: string;
  name: string;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLeaf: boolean;
  fullName: string;
  imageCount: number;
}

const buildFolderTree = (foldersList: string[], folderImagesMap: Record<string, any[]>): Record<string, FolderTreeNode> => {
  const root: Record<string, FolderTreeNode> = {};
  
  foldersList.forEach(folder => {
    const parts = folder.split(' -> ').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return;
    
    let currentChildren = root;
    let runningPath = '';
    
    parts.forEach((part, index) => {
      runningPath = runningPath ? `${runningPath} -> ${part}` : part;
      const isLast = index === parts.length - 1;
      
      if (!currentChildren[part]) {
        currentChildren[part] = {
          name: part,
          fullName: isLast ? folder : runningPath,
          isLeaf: isLast,
          imageCount: isLast ? (folderImagesMap[folder]?.length || 0) : 0,
          children: {}
        };
      } else {
        if (isLast) {
          currentChildren[part].isLeaf = true;
          currentChildren[part].fullName = folder;
          currentChildren[part].imageCount = folderImagesMap[folder]?.length || 0;
        }
      }
      currentChildren = currentChildren[part].children;
    });
  });
  
  return root;
};

export const AdminPanel: React.FC = () => {
  // Session Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('motes_admin_auth') === 'true';
  });

  // Registered Authenticators (Max 2 Devices/Tokens)
  const [registeredAuthenticators, setRegisteredAuthenticators] = useState<RegisteredAuthenticator[]>(() => {
    const saved = localStorage.getItem('motes_registered_authenticators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 2);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Modal states for registering a new authenticator inside Admin Panel
  const [showAddAuthModal, setShowAddAuthModal] = useState<boolean>(false);
  const [newAuthSlot, setNewAuthSlot] = useState<1 | 2>(1);
  const [newAuthName, setNewAuthName] = useState<string>('');
  const [newAuthSecret, setNewAuthSecret] = useState<string>('');
  const [newAuthVerifyCode, setNewAuthVerifyCode] = useState<string>('');
  const [newAuthCopied, setNewAuthCopied] = useState<boolean>(false);
  const [newAuthError, setNewAuthError] = useState<string>('');

  // Modal state for viewing an existing registered authenticator's QR / Secret
  const [viewingAuth, setViewingAuth] = useState<RegisteredAuthenticator | null>(null);
  const [viewingAuthCopied, setViewingAuthCopied] = useState<boolean>(false);

  // Fallback 2FA secret for emergency reset backwards compatibility
  const [currentSecret, setCurrentSecret] = useState<string>(() => {
    return localStorage.getItem('motes_admin_2fa_secret') || 'MOTESADMINSECRET';
  });
  const [is2faEnabled, setIs2faEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('motes_admin_2fa_enabled');
    return saved === 'true';
  });

  // Custom Administrator Identity States
  const [customAdminId, setCustomAdminId] = useState<string>(() => {
    return localStorage.getItem('motes_admin_custom_id') || DEFAULT_ADMIN_CREDENTIALS.adminId;
  });
  const [customAdminEmail, setCustomAdminEmail] = useState<string>(() => {
    return localStorage.getItem('motes_admin_custom_email') || DEFAULT_ADMIN_CREDENTIALS.email;
  });
  const [customPassphrase, setCustomPassphrase] = useState<string>(() => {
    return localStorage.getItem('motes_admin_password') || DEFAULT_ADMIN_CREDENTIALS.passphrase;
  });

  // Alternative login option toggle (Bypasses 2FA via ID + Passphrase if Authenticator is broken)
  const [useAlternativeLogin, setUseAlternativeLogin] = useState<boolean>(false);

  // QR Scan Modal state on the login screen
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Current database records (Tickets, configuration logs)
  const [tickets, setTickets] = useState<InquiryTicket[]>([]);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [code2faInput, setCode2faInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isMasterSession, setIsMasterSession] = useState<boolean>(() => {
    return sessionStorage.getItem('motes_admin_is_master') === 'true';
  });

  // 2FA Wizard State (Enrollment)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [tempSecret, setTempSecret] = useState('');
  const [tempPassword, setTempPassword] = useState(DEFAULT_ADMIN_CREDENTIALS.passphrase);
  const [wizardCodeInput, setWizardCodeInput] = useState('');
  const [wizardIdInput, setWizardIdInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Emergency Reset States (Validates primary default email's authenticator code)
  const [showEmergencyResetModal, setShowEmergencyResetModal] = useState(false);
  const [resetTotpCode, setResetTotpCode] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Credentials Backup States
  const [showBackupPasswordModal, setShowBackupPasswordModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [backupMode, setBackupMode] = useState<'export' | 'import'>('export');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [backupModalError, setBackupModalError] = useState('');

  // Active Admin Panel Tab
  const [activeTab, setActiveTab] = useState<'tickets' | 'projects' | 'telemetry' | 'settings' | 'audit' | 'media'>('tickets');

  // Default site image fallback
  const [defaultSiteImage, setDefaultSiteImage] = useState(() => localStorage.getItem('motes_default_site_image') || 'https://i.postimg.cc/tTn7YWZ8/DEFAULT.png');

  // Projects list states
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projClient, setProjClient] = useState('');
  const [projSite, setProjSite] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projCountry, setProjCountry] = useState('');
  const [projState, setProjState] = useState('');
  const [projDistrict, setProjDistrict] = useState('');
  const [projCity, setProjCity] = useState('');
  const [projArea, setProjArea] = useState('');

  // Automatically synchronize location string when component-specific fields update
  useEffect(() => {
    const loc = [projArea.trim(), projCity.trim(), projDistrict.trim(), projState.trim(), projCountry.trim()].filter(Boolean).join(', ');
    setProjLocation(loc);
  }, [projArea, projCity, projDistrict, projState, projCountry]);

  const [projDescription, setProjDescription] = useState('');
  const [projFy, setProjFy] = useState('');
  const [projStatus, setProjStatus] = useState<'Completed' | 'Ongoing' | 'Under Commissioning'>('Completed');
  const [projTech, setProjTech] = useState('SBR');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectSortField, setProjectSortField] = useState<'fy' | 'tech' | 'status' | 'id'>('id');
  const [projectSortOrder, setProjectSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search/Filter properties for Tickets
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Ticket for details modal / editor
  const [editingTicket, setEditingTicket] = useState<InquiryTicket | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [engineerNotes, setEngineerNotes] = useState('');

  // Site Folders and associated media images
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('motes_media_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const sites = Array.from(new Set(PROJECTS_DATA.map(p => getFolderKeyForProject(p)))).filter(Boolean).sort();
    return sites;
  });

  const [selectedFolder, setSelectedFolder] = useState<string>(() => {
    const saved = localStorage.getItem('motes_media_folders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    const sites = Array.from(new Set(PROJECTS_DATA.map(p => getFolderKeyForProject(p)))).filter(Boolean).sort();
    return sites[0] || 'Madhya Pradesh -> Indore -> Indore -> Kabirkhedi -> 245 MLD';
  });
  const [newFolderName, setNewFolderName] = useState<string>('');

  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedFolder) {
      const parts = selectedFolder.split(' -> ').map(p => p.trim()).filter(Boolean);
      let running = '';
      setExpandedPaths(prev => {
        const updated = { ...prev };
        parts.forEach((part, idx) => {
          if (idx < parts.length - 1) {
            running = running ? `${running} -> ${part}` : part;
            updated[running] = true;
          }
        });
        return updated;
      });
    }
  }, [selectedFolder]);

  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const [folderImages, setFolderImages] = useState<Record<string, { name: string; url: string; date: string; size: string }[]>>(() => {
    const getOldFolderKey = (p: any) => {
      if (!p || !p.location) return "General Folder";
      const parts = p.location.split(',').map((s: string) => s.trim()).filter(Boolean);
      const reversedParts = [...parts].reverse();

      let state = 'General State';
      let district = '';
      let city = '';
      let area = '';

      if (reversedParts.length === 1) {
        state = reversedParts[0];
      } else if (reversedParts.length === 2) {
        state = reversedParts[0];
        city = reversedParts[1];
        district = reversedParts[1];
      } else if (reversedParts.length === 3) {
        state = reversedParts[0];
        district = reversedParts[1];
        city = reversedParts[1];
        area = reversedParts[2];
      } else if (reversedParts.length >= 4) {
        state = reversedParts[0];
        district = reversedParts[1];
        city = reversedParts[2];
        area = reversedParts[3];
      }

      let locationFlow = '';
      if (district && city && district !== city) {
        locationFlow = `${state} -> ${district} -> ${city}`;
      } else if (city) {
        locationFlow = `${state} -> ${city} -> ${city}`;
      } else {
        locationFlow = state;
      }

      if (area) {
        locationFlow += ` -> ${area}`;
      }

      const textToSearch = `${p.site} ${p.description || ''}`;
      const mldRegex = /(\d+(?:\.\d+)?\s*(?:MLD|KLD|m3\/day))/i;
      const match = textToSearch.match(mldRegex);
      const mldValue = match ? match[0].toUpperCase().trim() : '';

      return mldValue 
        ? `${locationFlow} -> ${mldValue}`
        : `${locationFlow} -> ${p.site}`;
    };

    const saved = localStorage.getItem('motes_media_folder_images_v3');
    let loaded: Record<string, { name: string; url: string; date: string; size: string }[]> = {};
    if (saved) {
      try {
        loaded = JSON.parse(saved);
        
        // Dynamic key migration for existing saves
        PROJECTS_DATA.forEach(p => {
          const oldKey = getOldFolderKey(p);
          const newKey = getFolderKeyForProject(p);
          if (oldKey !== newKey && loaded[oldKey] && !loaded[newKey]) {
            loaded[newKey] = loaded[oldKey];
            delete loaded[oldKey];
          }
        });
      } catch (e) {
        loaded = {};
      }
    } else {
      // Migrate from old V2 keys or INITIAL_MEDIA_FOLDER_IMAGES
      const savedV2 = localStorage.getItem('motes_media_folder_images_v2');
      let tempMap: Record<string, { name: string; url: string; date: string; size: string }[]> = {};
      if (savedV2) {
        try {
          tempMap = JSON.parse(savedV2);
        } catch (e) {}
      } else {
        tempMap = INITIAL_MEDIA_FOLDER_IMAGES;
      }

      PROJECTS_DATA.forEach(p => {
        const oldKey = p.site;
        const newKey = getFolderKeyForProject(p);
        const imgs = tempMap[oldKey] || tempMap[oldKey.trim()];
        if (imgs) {
          loaded[newKey] = imgs;
        }
      });
      localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(loaded));
    }
    return loaded;
  });

  const visibleTreeRows = React.useMemo(() => {
    const tree = buildFolderTree(folders, folderImages);
    const rows: TreeRow[] = [];
    
    const traverse = (nodeMap: Record<string, FolderTreeNode>, level: number, parentPath: string) => {
      const keys = Object.keys(nodeMap).sort();
      keys.forEach(key => {
        const node = nodeMap[key];
        const nodePath = parentPath ? `${parentPath} -> ${key}` : key;
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = !!expandedPaths[nodePath];
        const isLeaf = node.isLeaf || !hasChildren;
        
        rows.push({
          id: nodePath,
          name: node.name,
          level,
          hasChildren,
          isExpanded,
          isLeaf,
          fullName: node.fullName,
          imageCount: node.imageCount
        });
        
        if (hasChildren && isExpanded) {
          traverse(node.children, level + 1, nodePath);
        }
      });
    };
    
    traverse(tree, 0, '');
    return rows;
  }, [folders, folderImages, expandedPaths]);

  // Dynamically synchronize media folders with current project site names based on structured location flow & capacities
  useEffect(() => {
    if (projectsList && projectsList.length > 0) {
      const folderKeys = Array.from(new Set(projectsList.map(p => getFolderKeyForProject(p)))).filter(Boolean).sort();
      setFolders(folderKeys);
      if (folderKeys.length > 0 && !folderKeys.includes(selectedFolder)) {
        setSelectedFolder(folderKeys[0]);
      }
    }
  }, [projectsList]);

  // Upload queue for real-time progress bars
  interface UploadTask {
    id: string;
    name: string;
    progress: number;
    size: string;
    status: 'uploading' | 'completed' | 'error';
  }
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const [imageAddMethod, setImageAddMethod] = useState<'upload' | 'url'>('upload');
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [inputImageName, setInputImageName] = useState('');
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('motes_media_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(folderImages));
    window.dispatchEvent(new Event('motes_media_folder_images_updated'));
  }, [folderImages]);

  // System Config Settings (Persistent override of contact credentials)
  const [corpPhone, setCorpPhone] = useState(() => localStorage.getItem('motes_contact_phone') || '+91 9667989921');
  const [corpEmail, setCorpEmail] = useState(() => localStorage.getItem('motes_contact_email') || 'motesenviro@gmail.com');
  const [alertState, setAlertState] = useState(() => localStorage.getItem('motes_system_alert') || 'Normal Operational');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('motes_admin_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic Telemetry States (Simulated live bio-reactor/aeration metrics)
  const [waterFlow, setWaterFlow] = useState(14.5);
  const [phLevel, setPhLevel] = useState(7.2);
  const [dissolvedOxygen, setDissolvedOxygen] = useState(4.2);
  const [biomassLoad, setBiomassLoad] = useState(88.0);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<string>('');

  // Initialize and load inquiry tickets + system telemetry + work records
  useEffect(() => {
    loadInquiryTickets();
    loadProjects();
    setLastTelemetryUpdate(new Date().toLocaleTimeString());

    // Gentle live fluctuations to make system dashboard feel operational and dynamic
    const telemetryInterval = setInterval(() => {
      setWaterFlow(prev => Math.max(8.0, Math.min(22.0, Number((prev + (Math.random() * 1.2 - 0.6)).toFixed(1)))));
      setPhLevel(prev => Math.max(6.5, Math.min(8.5, Number((prev + (Math.random() * 0.16 - 0.08)).toFixed(2)))));
      setDissolvedOxygen(prev => Math.max(2.5, Math.min(6.5, Number((prev + (Math.random() * 0.4 - 0.2)).toFixed(2)))));
      setBiomassLoad(prev => Math.max(75, Math.min(98, Number((prev + (Math.random() * 1.8 - 0.9)).toFixed(1)))));
      setLastTelemetryUpdate(new Date().toLocaleTimeString());
    }, 4500);

    return () => clearInterval(telemetryInterval);
  }, []);

  const loadInquiryTickets = () => {
    const saved = localStorage.getItem('motes_inquiry_tickets');
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadProjects = () => {
    const saved = localStorage.getItem('motes_projects_list');
    if (saved) {
      try {
        let parsed = JSON.parse(saved) as Project[];
        let migratedAny = false;
        
        // Migrate "Philippines Projects" site names to "Industrial Sewage Treatment Plant"
        parsed = parsed.map(p => {
          if (p.site === "Philippines Projects") {
            migratedAny = true;
            return { ...p, site: "Industrial Sewage Treatment Plant" };
          }
          return p;
        });

        let modified = false;
        const migrated = parsed.map(p => {
          if (!p.imageUrl) {
            const defImg = getProjectImageDefault(p.id, p.site, p.client, p.location) || localStorage.getItem('motes_default_site_image') || '';
            if (defImg) {
              modified = true;
              return { ...p, imageUrl: defImg };
            }
          }
          return p;
        });
        if (migratedAny || modified) {
          localStorage.setItem('motes_projects_list', JSON.stringify(migrated));
          setProjectsList(migrated);
        } else {
          setProjectsList(parsed);
        }
      } catch (e) {
        setProjectsList(PROJECTS_DATA);
      }
    } else {
      // First time loading PROJECTS_DATA, let's also fill any blanks with the global default if applicable
      const globalDefault = localStorage.getItem('motes_default_site_image') || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
      const initialized = PROJECTS_DATA.map(p => {
        if (!p.imageUrl) {
          const defImg = getProjectImageDefault(p.id, p.site, p.client, p.location) || globalDefault;
          return { ...p, imageUrl: defImg };
        }
        return p;
      });
      setProjectsList(initialized);
      localStorage.setItem('motes_projects_list', JSON.stringify(initialized));
    }
  };

  const saveProjects = (updatedList: Project[]) => {
    setProjectsList(updatedList);
    localStorage.setItem('motes_projects_list', JSON.stringify(updatedList));
    // Publish a global event so that other components (like ExperienceView) update reactively
    window.dispatchEvent(new Event('motes_projects_updated'));
  };

  const resetProjectForm = () => {
    setProjClient('');
    setProjSite('');
    setProjLocation('');
    setProjDescription('');
    setProjFy('');
    setProjStatus('Completed');
    setProjTech('SBR');
    setProjImageUrl('');
    setProjCountry('');
    setProjState('');
    setProjDistrict('');
    setProjCity('');
    setProjArea('');
  };

  const getProjectImageDynamic = (proj: Project) => {
    const folderKey = getFolderKeyForProject(proj);
    const imagesInFolder = folderImages[folderKey];
    if (imagesInFolder && imagesInFolder.length > 0) {
      return imagesInFolder[0].url;
    }
    return defaultSiteImage || "https://i.postimg.cc/tTn7YWZ8/DEFAULT.png";
  };

  const handleEditProjectClick = (proj: Project) => {
    setEditingProject(proj);
    setProjClient(proj.client);
    setProjSite(proj.site);
    setProjLocation(proj.location);
    setProjDescription(proj.description);
    setProjFy(proj.fy);
    setProjStatus(proj.status);
    setProjTech(proj.tech);
    setProjImageUrl(proj.imageUrl || '');

    // Set location-specific fields
    const countryVal = proj.country || '';
    const stateVal = proj.state || '';
    const districtVal = proj.district || '';
    const cityVal = proj.city || '';
    const areaVal = proj.area || '';

    setProjCountry(countryVal);
    setProjState(stateVal);
    setProjDistrict(districtVal);
    setProjCity(cityVal);
    setProjArea(areaVal);

    // Parse legacy locations
    if (!countryVal && !stateVal && !districtVal && !cityVal && !areaVal && proj.location) {
      const parts = proj.location.split(',').map(s => s.trim()).filter(Boolean);
      const rev = [...parts].reverse();
      if (rev.length === 1) {
        setProjState(rev[0]);
      } else if (rev.length === 2) {
        setProjState(rev[1]);
        setProjCountry(rev[0]);
      } else if (rev.length === 3) {
        setProjArea(rev[2]);
        setProjCity(rev[1]);
        setProjState(rev[0]);
      } else if (rev.length === 4) {
        setProjArea(rev[3]);
        setProjCity(rev[2]);
        setProjState(rev[1]);
        setProjCountry(rev[0]);
      } else if (rev.length >= 5) {
        setProjArea(rev[4]);
        setProjCity(rev[3]);
        setProjDistrict(rev[2]);
        setProjState(rev[1]);
        setProjCountry(rev[0]);
      }
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLoc = [projArea.trim(), projCity.trim(), projDistrict.trim(), projState.trim(), projCountry.trim()].filter(Boolean).join(', ');
    if (!projClient || !projSite || !finalLoc || !projDescription || !projFy || !projTech) {
      alert('Please fill in all required fields (including State and Country).');
      return;
    }
    const newId = projectsList.length > 0 ? Math.max(...projectsList.map(p => p.id)) + 1 : 1;
    const finalImg = projImageUrl.trim() || getProjectImageDefault(newId, projSite, projClient, finalLoc) || defaultSiteImage || undefined;
    const newProj: Project = {
      id: newId,
      client: projClient,
      site: projSite,
      location: finalLoc,
      description: projDescription,
      fy: projFy,
      status: projStatus,
      tech: projTech,
      imageUrl: finalImg,
      country: projCountry.trim(),
      state: projState.trim(),
      district: projDistrict.trim(),
      city: projCity.trim(),
      area: projArea.trim()
    };

    const updated = [newProj, ...projectsList];
    saveProjects(updated);
    
    // Auto folder creation
    const newFolderKey = getFolderKeyForProject(newProj);
    setFolders(prev => {
      const updatedFolders = prev.includes(newFolderKey) ? prev : [...prev, newFolderKey].sort();
      localStorage.setItem('motes_media_folders', JSON.stringify(updatedFolders));
      return updatedFolders;
    });
    setSelectedFolder(newFolderKey);

    addAuditLog(`Created work record ID: ${newId} ("${projClient}") and auto-created directory "${newFolderKey}"`);
    resetProjectForm();
    setIsAddingProject(false);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const finalLoc = [projArea.trim(), projCity.trim(), projDistrict.trim(), projState.trim(), projCountry.trim()].filter(Boolean).join(', ');
    if (!projClient || !projSite || !finalLoc || !projDescription || !projFy || !projTech) {
      alert('Please fill in all required fields (including State and Country).');
      return;
    }

    const oldFolderKey = getFolderKeyForProject(editingProject);

    const updated = projectsList.map(p => {
      if (p.id === editingProject.id) {
        const finalImg = projImageUrl.trim() || getProjectImageDefault(p.id, projSite, projClient, finalLoc) || defaultSiteImage || undefined;
        return {
          ...p,
          client: projClient,
          site: projSite,
          location: finalLoc,
          description: projDescription,
          fy: projFy,
          status: projStatus,
          tech: projTech,
          imageUrl: finalImg,
          country: projCountry.trim(),
          state: projState.trim(),
          district: projDistrict.trim(),
          city: projCity.trim(),
          area: projArea.trim()
        };
      }
      return p;
    });

    saveProjects(updated);

    const updatedProj = updated.find(p => p.id === editingProject.id)!;
    const newFolderKey = getFolderKeyForProject(updatedProj);

    // If folder name changed, copy/migrate media assets in folderImages to prevent data loss
    if (oldFolderKey !== newFolderKey) {
      setFolderImages(prev => {
        const oldImages = prev[oldFolderKey] || [];
        const newImages = prev[newFolderKey] || [];
        const mergedImages = [...newImages, ...oldImages];
        const updatedImages = {
          ...prev,
          [newFolderKey]: mergedImages
        };
        // Clean up old folder to keep registry clean
        delete updatedImages[oldFolderKey];
        return updatedImages;
      });

      setFolders(prev => {
        let updatedFolders = prev.filter(f => f !== oldFolderKey);
        if (!updatedFolders.includes(newFolderKey)) {
          updatedFolders.push(newFolderKey);
        }
        updatedFolders.sort();
        localStorage.setItem('motes_media_folders', JSON.stringify(updatedFolders));
        return updatedFolders;
      });
    }

    setSelectedFolder(newFolderKey);

    addAuditLog(`Updated work record ID: ${editingProject.id} ("${projClient}"). Directory updated to "${newFolderKey}"`);
    resetProjectForm();
    setEditingProject(null);
  };

  const handleDeleteProject = (id: number, clientName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the work record for "${clientName}"?`)) {
      const projToDelete = projectsList.find(p => p.id === id);
      const updated = projectsList.filter(p => p.id !== id);
      saveProjects(updated);
      
      if (projToDelete) {
        const folderKey = getFolderKeyForProject(projToDelete);
        
        // Remove from folderImages state to prevent local storage bloat
        setFolderImages(prev => {
          const updatedImages = { ...prev };
          delete updatedImages[folderKey];
          return updatedImages;
        });

        // Remove from folders state
        setFolders(prev => {
          const updatedFolders = prev.filter(f => f !== folderKey);
          localStorage.setItem('motes_media_folders', JSON.stringify(updatedFolders));
          return updatedFolders;
        });
      }

      addAuditLog(`Deleted work record ID: ${id} ("${clientName}")`);
    }
  };

  const addAuditLog = (action: string) => {
    const timestamp = new Date().toLocaleString();
    const message = `[${timestamp}] ${action}`;
    const updated = [message, ...auditLogs].slice(0, 50); // Keep last 50 logs
    setAuditLogs(updated);
    localStorage.setItem('motes_admin_audit_logs', JSON.stringify(updated));
  };

  const handleExportCredentials = () => {
    setBackupMode('export');
    setBackupPassword('');
    setBackupModalError('');
    setShowBackupPasswordModal(true);
  };

  const handleImportCredentials = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setBackupMode('import');
    setBackupPassword('');
    setBackupModalError('');
    setShowBackupPasswordModal(true);
    e.target.value = ''; // Reset input
  };

  const executeExport = async () => {
    if (!backupPassword) {
      setBackupModalError('Please set a password to encrypt and secure your backup file.');
      return;
    }
    try {
      const dataToBackup = {
        adminId: customAdminId,
        email: customAdminEmail,
        passphrase: customPassphrase,
        registeredAuthenticators: registeredAuthenticators,
        totpSecret: registeredAuthenticators[0]?.secret || currentSecret,
        is2faEnabled: registeredAuthenticators.length > 0,
        exportDate: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(dataToBackup);
      const encryptedString = await encryptData(jsonString, backupPassword);
      
      const backupPayload = {
        type: "motes_security_backup",
        version: "1.1",
        encrypted: true,
        data: encryptedString
      };
      
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motes_admin_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowBackupPasswordModal(false);
      addAuditLog('Successfully exported encrypted administrator credential backup file (including registered authenticators).');
      setSuccessMsg('Admin credential backup file exported successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setBackupModalError('Encryption failed. Please try a different password.');
    }
  };

  const executeImport = async () => {
    if (!pendingImportFile) return;
    if (!backupPassword) {
      setBackupModalError('Please enter the password to decrypt the backup file.');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const parsed = JSON.parse(content);
          
          if (parsed.type !== "motes_security_backup" || !parsed.data) {
            setBackupModalError('Invalid file: This is not a valid Motes Envirotech security backup.');
            return;
          }
          
          const decryptedString = await decryptData(parsed.data, backupPassword);
          const credentials = JSON.parse(decryptedString);
          
          if (!credentials.adminId || !credentials.email || !credentials.passphrase) {
            setBackupModalError('Backup contains incomplete or corrupted administrator credentials.');
            return;
          }
          
          // Apply imported credentials
          localStorage.setItem('motes_admin_custom_id', credentials.adminId);
          localStorage.setItem('motes_admin_password', credentials.passphrase);
          localStorage.setItem('motes_admin_custom_email', credentials.email);
          
          setCustomAdminId(credentials.adminId);
          setCustomAdminEmail(credentials.email);
          setCustomPassphrase(credentials.passphrase);

          if (Array.isArray(credentials.registeredAuthenticators)) {
            const importedAuths: RegisteredAuthenticator[] = credentials.registeredAuthenticators.slice(0, 2);
            localStorage.setItem('motes_registered_authenticators', JSON.stringify(importedAuths));
            setRegisteredAuthenticators(importedAuths);
            if (importedAuths[0]) {
              localStorage.setItem('motes_admin_2fa_secret', importedAuths[0].secret);
              setCurrentSecret(importedAuths[0].secret);
            }
          } else if (credentials.totpSecret) {
            const fallbackAuth: RegisteredAuthenticator = {
              id: `auth_imported_${Date.now()}`,
              name: 'Primary Authenticator',
              secret: credentials.totpSecret,
              createdAt: credentials.exportDate || new Date().toISOString()
            };
            localStorage.setItem('motes_registered_authenticators', JSON.stringify([fallbackAuth]));
            localStorage.setItem('motes_admin_2fa_secret', credentials.totpSecret);
            setRegisteredAuthenticators([fallbackAuth]);
            setCurrentSecret(credentials.totpSecret);
          }
          
          setShowBackupPasswordModal(false);
          setPendingImportFile(null);
          addAuditLog('Restored administrator identity and authenticator devices from encrypted backup.');
          setSuccessMsg('Admin identity and authenticators restored from secure backup successfully.');
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          console.error(err);
          setBackupModalError('Decryption failed: Incorrect password or corrupted backup file.');
        }
      };
      reader.readAsText(pendingImportFile);
    } catch (err) {
      setBackupModalError('Failed to read the backup file.');
    }
  };

  // Triggers secure login verification
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Case 1: No authenticators registered (1st time access or both disconnected) -> ID & Passphrase login
    if (registeredAuthenticators.length === 0) {
      const enteredId = adminIdInput.trim();
      const enteredPass = passwordInput;

      if (!enteredId) {
        setErrorMsg('Please enter your Administrator Username/ID.');
        return;
      }

      if (!enteredPass) {
        setErrorMsg('Please enter your Security Passphrase.');
        return;
      }

      const isMatch = (
        (enteredId === customAdminId && enteredPass === customPassphrase) ||
        (enteredId === DEFAULT_ADMIN_CREDENTIALS.adminId && enteredPass === DEFAULT_ADMIN_CREDENTIALS.passphrase)
      );

      if (isMatch) {
        setIsLoggedIn(true);
        setIsMasterSession(enteredId === DEFAULT_ADMIN_CREDENTIALS.adminId);
        sessionStorage.setItem('motes_admin_auth', 'true');
        sessionStorage.setItem('motes_admin_is_master', enteredId === DEFAULT_ADMIN_CREDENTIALS.adminId ? 'true' : 'false');
        setPasswordInput('');
        setAdminIdInput('');
        setCode2faInput('');
        addAuditLog(`Administrator "${enteredId}" authenticated successfully via ID & Password (no authenticators registered).`);
      } else {
        setErrorMsg('Invalid Administrator Username/ID or Password credentials.');
        addAuditLog(`Failed login attempt (ID & Pass): Invalid credentials for username "${enteredId}".`);
      }
      return;
    }

    // Case 2: At least 1 authenticator registered -> Authenticator Code ONLY!
    const enteredCode = code2faInput.trim();

    if (!enteredCode) {
      setErrorMsg('Please enter your 6-digit Authenticator Verification Code.');
      return;
    }

    if (enteredCode.length !== 6) {
      setErrorMsg('Verification code must be exactly 6 digits.');
      return;
    }

    let matchedDevice: RegisteredAuthenticator | null = null;

    for (const dev of registeredAuthenticators) {
      const codeNow = await generateTOTP(dev.secret, 0);
      const codeBefore = await generateTOTP(dev.secret, -1);
      const codeAfter = await generateTOTP(dev.secret, 1);

      if (enteredCode === codeNow || enteredCode === codeBefore || enteredCode === codeAfter) {
        matchedDevice = dev;
        break;
      }
    }

    if (matchedDevice) {
      setIsLoggedIn(true);
      setIsMasterSession(false);
      sessionStorage.setItem('motes_admin_auth', 'true');
      sessionStorage.setItem('motes_admin_is_master', 'false');
      setPasswordInput('');
      setAdminIdInput('');
      setCode2faInput('');
      addAuditLog(`Admin authenticated successfully using registered authenticator "${matchedDevice.name}".`);
    } else {
      setErrorMsg('Invalid 6-digit Authenticator Code. Please check the current code on your registered device.');
      addAuditLog(`Failed authenticator login attempt. Code entered: ${enteredCode}`);
    }
  };

  // Authenticator Device Management (Max 2 devices)
  const handleOpenAddDevice = (slot: 1 | 2) => {
    if (registeredAuthenticators.length >= 2) {
      alert('Limit reached: Only 2 registered authenticators are allowed. Disconnect an existing device first.');
      return;
    }
    setNewAuthSlot(slot);
    setNewAuthName(slot === 1 ? 'Primary Authenticator' : 'Secondary Authenticator');
    const secret = generateRandomSecret();
    setNewAuthSecret(secret);
    setNewAuthVerifyCode('');
    setNewAuthError('');
    setNewAuthCopied(false);
    setShowAddAuthModal(true);
  };

  const handleCopyNewAuthSecret = () => {
    navigator.clipboard.writeText(newAuthSecret);
    setNewAuthCopied(true);
    setTimeout(() => setNewAuthCopied(false), 2000);
  };

  const handleCopyViewingAuthSecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setViewingAuthCopied(true);
    setTimeout(() => setViewingAuthCopied(false), 2000);
  };

  const handleVerifyAndSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAuthError('');

    if (registeredAuthenticators.length >= 2) {
      setNewAuthError('Maximum limit reached: Only 2 registered authenticators are allowed.');
      return;
    }

    const code = newAuthVerifyCode.trim();
    if (!code || code.length !== 6) {
      setNewAuthError('Please enter a valid 6-digit code from your authenticator app.');
      return;
    }

    const codeNow = await generateTOTP(newAuthSecret, 0);
    const codeBefore = await generateTOTP(newAuthSecret, -1);
    const codeAfter = await generateTOTP(newAuthSecret, 1);

    if (code === codeNow || code === codeBefore || code === codeAfter) {
      const newDevice: RegisteredAuthenticator = {
        id: `auth_${Date.now()}`,
        name: newAuthName.trim() || `Device ${registeredAuthenticators.length + 1}`,
        secret: newAuthSecret,
        createdAt: new Date().toISOString()
      };
      const updated = [...registeredAuthenticators, newDevice].slice(0, 2);
      setRegisteredAuthenticators(updated);
      localStorage.setItem('motes_registered_authenticators', JSON.stringify(updated));
      localStorage.setItem('motes_admin_2fa_enabled', 'true');
      localStorage.setItem('motes_admin_2fa_secret', updated[0].secret);
      setCurrentSecret(updated[0].secret);
      setIs2faEnabled(true);

      addAuditLog(`Registered authenticator device #${updated.length}: "${newDevice.name}".`);
      setShowAddAuthModal(false);
      setSuccessMsg(`Authenticator "${newDevice.name}" registered successfully! Authenticator-only login is now active.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setNewAuthError('Verification failed: Code does not match. Please verify that your authenticator device clock is synced with UTC.');
    }
  };

  const handleDisconnectDevice = (authId: string) => {
    const auth = registeredAuthenticators.find(a => a.id === authId);
    if (!auth) return;
    const isLast = registeredAuthenticators.length === 1;
    const confirmMsg = isLast
      ? `Disconnect "${auth.name}"?\n\nWARNING: This is your only registered authenticator. Disconnecting it will leave 0 active authenticators, meaning Admin Panel login will revert to Administrator ID & Password only.\n\nDo you want to proceed?`
      : `Disconnect "${auth.name}"?\n\nThe remaining registered authenticator will continue to protect Admin Panel access.\n\nDo you want to proceed?`;

    if (window.confirm(confirmMsg)) {
      const updated = registeredAuthenticators.filter(a => a.id !== authId);
      setRegisteredAuthenticators(updated);
      localStorage.setItem('motes_registered_authenticators', JSON.stringify(updated));
      
      if (updated.length === 0) {
        localStorage.setItem('motes_admin_2fa_enabled', 'false');
        setIs2faEnabled(false);
        addAuditLog(`Both authenticators disconnected. Admin login automatically reverted to ID & Password.`);
        setSuccessMsg(`Device disconnected. All authenticators are now disconnected — login has reverted to ID & Password.`);
      } else {
        localStorage.setItem('motes_admin_2fa_secret', updated[0].secret);
        setCurrentSecret(updated[0].secret);
        addAuditLog(`Disconnected authenticator device "${auth.name}". Remaining active devices: ${updated.length} of 2.`);
        setSuccessMsg(`Device "${auth.name}" disconnected successfully.`);
      }
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // Logs the administrator out safely
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMasterSession(false);
    sessionStorage.removeItem('motes_admin_auth');
    sessionStorage.removeItem('motes_admin_is_master');
    addAuditLog('Administrator session ended.');
  };

  // Trigger custom in-UI emergency reset flow
  const handleResetSecurityConfiguration = () => {
    setShowEmergencyResetModal(true);
    setResetTotpCode('');
    setResetError('');
    setResetSuccess('');
  };

  // Perform safe reset on master primary email authenticator verification or master passphrase
  const executeEmergencySecurityReset = async () => {
    setResetError('');
    setResetSuccess('');

    const enteredCode = resetTotpCode.trim();

    if (!enteredCode) {
      setResetError('Please enter the 6-digit verification code from the primary default authenticator or Master Passphrase.');
      return;
    }

    // Check either default TOTP or Master Passphrase
    const defaultSecret = 'MOTESADMINSECRET';
    const codeNow = await generateTOTP(defaultSecret, 0);
    const codeBefore = await generateTOTP(defaultSecret, -1);
    const codeAfter = await generateTOTP(defaultSecret, 1);

    const isTotpMatch = (enteredCode === codeNow || enteredCode === codeBefore || enteredCode === codeAfter);
    const isPassMatch = (enteredCode === DEFAULT_ADMIN_CREDENTIALS.passphrase);

    if (!isTotpMatch && !isPassMatch) {
      setResetError(`Verification failed: The supplied code is invalid. Enter either the 6-digit TOTP key or Master Passphrase.`);
      addAuditLog('Emergency Force Reset Blocked: Invalid reset token/passphrase.');
      return;
    }

    // Success: Erase custom settings and restore master parameters
    localStorage.setItem('motes_admin_custom_id', DEFAULT_ADMIN_CREDENTIALS.adminId);
    localStorage.setItem('motes_admin_password', DEFAULT_ADMIN_CREDENTIALS.passphrase);
    localStorage.setItem('motes_admin_custom_email', DEFAULT_ADMIN_CREDENTIALS.email);
    localStorage.setItem('motes_admin_2fa_secret', defaultSecret);
    localStorage.setItem('motes_admin_2fa_enabled', 'false');
    // Clear all registered authenticators so login reverts to ID & Pass!
    localStorage.setItem('motes_registered_authenticators', JSON.stringify([]));

    setCustomAdminId(DEFAULT_ADMIN_CREDENTIALS.adminId);
    setCustomPassphrase(DEFAULT_ADMIN_CREDENTIALS.passphrase);
    setCustomAdminEmail(DEFAULT_ADMIN_CREDENTIALS.email);
    setCurrentSecret(defaultSecret);
    setIs2faEnabled(false);
    setRegisteredAuthenticators([]);

    setIsLoggedIn(false);
    setWizardStep(1);
    setIsMasterSession(false);
    setWizardIdInput('');
    setTempPassword(DEFAULT_ADMIN_CREDENTIALS.passphrase);
    setWizardCodeInput('');
    setAdminIdInput('');
    setPasswordInput('');
    setCode2faInput('');

    sessionStorage.removeItem('motes_admin_auth');
    sessionStorage.removeItem('motes_admin_is_master');

    setResetSuccess('Emergency Reset Completed! Reverted credentials to defaults and disconnected all authenticators. Access restored to ID & Password.');
    addAuditLog('Emergency Reset Approved: Purged all authenticators and restored default ID & Password credentials.');

    // Dispatch the security alert email notification via our service
    await sendSecurityNotificationEmail({
      alertType: "EMERGENCY_FORCE_RESET_EXECUTED",
      timestamp: new Date().toISOString(),
      details: "An emergency force security reset was executed. All custom credentials have been reset to defaults and all authenticators were disconnected. Access reverted to ID & Password.",
      affectedCredentials: {
        adminId: DEFAULT_ADMIN_CREDENTIALS.adminId,
        email: DEFAULT_ADMIN_CREDENTIALS.email
      }
    });

    setTimeout(() => {
      setShowEmergencyResetModal(false);
      setResetTotpCode('');
      setResetError('');
      setResetSuccess('');
    }, 4500);
  };

  // Updates ticket status in memory and storage
  const handleUpdateTicketStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    const updated = tickets.map(t => {
      if (t.id === editingTicket.id) {
        return {
          ...t,
          status: newStatus,
          message: t.message.includes('\n[Internal Engineering Notes]') 
            ? t.message.split('\n[Internal Engineering Notes]')[0] + (engineerNotes ? `\n[Internal Engineering Notes]: ${engineerNotes}` : '')
            : t.message + (engineerNotes ? `\n[Internal Engineering Notes]: ${engineerNotes}` : '')
        };
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem('motes_inquiry_tickets', JSON.stringify(updated));
    setEditingTicket(null);
    setNewStatus('');
    setEngineerNotes('');
    addAuditLog(`Updated status of ticket ${editingTicket.id} to: ${newStatus}`);
  };

  // Purges a support ticket
  const handleDeleteTicket = (id: string) => {
    if (window.confirm(`Are you sure you want to delete ticket ${id}?`)) {
      const updated = tickets.filter(t => t.id !== id);
      setTickets(updated);
      localStorage.setItem('motes_inquiry_tickets', JSON.stringify(updated));
      addAuditLog(`Purged ticket reference: ${id}`);
    }
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    let name = newFolderName.trim();
    if (!name) return;

    // Ensure manual folders follow the exact 5-level hierarchy
    if (!name.includes(' -> ')) {
      const parts = name.split(',').map(s => s.trim()).filter(Boolean);
      const rev = [...parts].reverse();
      
      let state = rev[0] || 'General State';
      let district = rev[1] || `${state} District`;
      let city = rev[2] || district;
      let area = rev[3] || `${city} Area`;
      let site = rev[4] || parts[0] || 'Custom Site';
      
      name = `${state} -> ${district} -> ${city} -> ${area} -> ${site}`;
    }

    if (folders.includes(name)) {
      alert('A folder with this name already exists.');
      return;
    }
    const updatedFolders = [...folders, name].sort();
    setFolders(updatedFolders);
    setFolderImages(prev => ({
      ...prev,
      [name]: []
    }));
    setSelectedFolder(name);
    setNewFolderName('');
    addAuditLog(`Created site media directory folder: "${name}"`);
  };

  const handleSaveDefaultFallbackImage = (e: React.FormEvent) => {
    e.preventDefault();
    const url = defaultSiteImage.trim();
    localStorage.setItem('motes_default_site_image', url);
    addAuditLog(`Updated global site fallback image: ${url}`);
    setSuccessMsg('Default site image fallback updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApplyDefaultToImageless = () => {
    if (window.confirm('This will find all work records that do NOT have a custom image URL, and apply the current default fallback image. Proceed?')) {
      const updated = projectsList.map(p => {
        // If there's no custom imageUrl or if it's currently a placeholder/default
        const isDefault = p.imageUrl === undefined || p.imageUrl === '' || p.imageUrl.includes('placeholder') || p.imageUrl.includes('unsplash.com/photo-1581091226825');
        if (isDefault) {
          return {
            ...p,
            imageUrl: defaultSiteImage
          };
        }
        return p;
      });
      saveProjects(updated);
      addAuditLog(`Applied default fallback image to all imageless site records.`);
      alert('Applied default fallback image to all imageless records successfully!');
    }
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // We can simulate upload for each selected file
    Array.from(files).forEach((item, index) => {
      const file = item as File;
      const taskId = `${Date.now()}-${index}`;
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      const newUpload: UploadTask = {
        id: taskId,
        name: file.name,
        progress: 0,
        size: sizeStr,
        status: 'uploading'
      };

      setUploadQueue(prev => [newUpload, ...prev]);

      // Simulate real-time progress update
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 25) + 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Complete task
          setUploadQueue(prev => prev.map(t => t.id === taskId ? { ...t, progress: 100, status: 'completed' } : t));
          
          // Read, resize, and compress the image first to prevent QuotaExceededError in localStorage
          const reader = new FileReader();
          reader.onloadend = () => {
            const resultUrl = reader.result as string;
            
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1000;
              const MAX_HEIGHT = 1000;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round(height * (MAX_WIDTH / width));
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round(width * (MAX_HEIGHT / height));
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress heavily to JPEG 0.7 for optimal offline local storage limits (~40-100KB)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                const compressedSizeStr = `${(compressedBase64.length * 0.75 / 1024).toFixed(1)} KB`;

                setFolderImages(prev => {
                  const currentFolderImages = prev[selectedFolder] || [];
                  return {
                    ...prev,
                    [selectedFolder]: [
                      ...currentFolderImages,
                      {
                        name: file.name,
                        url: compressedBase64,
                        date: new Date().toISOString().split('T')[0],
                        size: compressedSizeStr
                      }
                    ]
                  };
                });
                addAuditLog(`Successfully uploaded compressed site photo "${file.name}" to directory "${selectedFolder}" (${compressedSizeStr})`);
              } else {
                // Fallback to original Base64 if 2D context fails
                setFolderImages(prev => {
                  const currentFolderImages = prev[selectedFolder] || [];
                  return {
                    ...prev,
                    [selectedFolder]: [
                      ...currentFolderImages,
                      {
                        name: file.name,
                        url: resultUrl,
                        date: new Date().toISOString().split('T')[0],
                        size: sizeStr
                      }
                    ]
                  };
                });
                addAuditLog(`Successfully uploaded site photo "${file.name}" to directory "${selectedFolder}"`);
              }
            };

            img.onerror = () => {
              // Fallback to original Base64 if not an image or fails to load
              setFolderImages(prev => {
                const currentFolderImages = prev[selectedFolder] || [];
                return {
                  ...prev,
                  [selectedFolder]: [
                    ...currentFolderImages,
                    {
                      name: file.name,
                      url: resultUrl,
                      date: new Date().toISOString().split('T')[0],
                      size: sizeStr
                    }
                  ]
                };
              });
              addAuditLog(`Successfully uploaded site photo "${file.name}" to directory "${selectedFolder}"`);
            };

            img.src = resultUrl;
          };
          reader.readAsDataURL(file);
        } else {
          setUploadQueue(prev => prev.map(t => t.id === taskId ? { ...t, progress: currentProgress } : t));
        }
      }, 200);
    });

    e.target.value = '';
  };

  const handleAddPhotoByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputImageUrl.trim() || !inputImageName.trim()) return;

    const newPhoto = {
      name: inputImageName.trim(),
      url: inputImageUrl.trim(),
      date: new Date().toISOString().split('T')[0],
      size: 'Direct Link'
    };

    setFolderImages(prev => {
      const list = prev[selectedFolder] || [];
      const updatedImages = {
        ...prev,
        [selectedFolder]: [...list, newPhoto]
      };
      localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(updatedImages));
      window.dispatchEvent(new Event('motes_media_folder_images_updated'));
      return updatedImages;
    });

    addAuditLog(`Added image URL "${newPhoto.name}" to directory "${selectedFolder}"`);
    setInputImageUrl('');
    setInputImageName('');
    alert(`Photo URL added successfully to ${selectedFolder}!`);
  };

  // Drag and drop photo reordering handlers
  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Support Firefox drag & drop
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handlePhotoDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) return;

    setFolderImages(prev => {
      const list = [...(prev[selectedFolder] || [])];
      const draggedItem = list[draggedPhotoIndex];
      // Remove item at draggedPhotoIndex
      list.splice(draggedPhotoIndex, 1);
      // Insert item at targetIndex
      list.splice(targetIndex, 0, draggedItem);

      const updated = {
        ...prev,
        [selectedFolder]: list
      };
      localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(updated));
      window.dispatchEvent(new Event('motes_media_folder_images_updated'));
      return updated;
    });

    addAuditLog(`Reordered photo assets in directory "${selectedFolder}" (Moved index ${draggedPhotoIndex} to ${targetIndex})`);
    setDraggedPhotoIndex(null);
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoIndex(null);
  };

  // Saves system override modifications
  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('motes_contact_phone', corpPhone);
    localStorage.setItem('motes_contact_email', corpEmail);
    localStorage.setItem('motes_system_alert', alertState);
    setSuccessMsg('Corporate configuration settings updated successfully. Client views have synced.');
    addAuditLog('Overrode default corporate contact and system status settings.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Saves dynamic security credentials override
  const handleSaveSecurityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const idValue = customAdminId.trim();
    const emailValue = customAdminEmail.trim();
    const passValue = customPassphrase;

    if (!idValue) {
      alert('Administrator ID / Username cannot be blank.');
      return;
    }

    if (!emailValue) {
      alert('Security Verification Email cannot be blank.');
      return;
    }

    if (!passValue || passValue.length < 6) {
      alert('Passphrase is too short! Must be at least 6 characters.');
      return;
    }

    localStorage.setItem('motes_admin_custom_id', idValue);
    localStorage.setItem('motes_admin_password', passValue);
    localStorage.setItem('motes_admin_custom_email', emailValue);

    setSuccessMsg('Administrator security credentials modified successfully. The active session has updated.');
    addAuditLog(`Updated security configuration: Saved custom Admin ID "${idValue}" and Email "${emailValue}".`);
    
    // Dispatch security notification
    sendSecurityNotificationEmail({
      alertType: "ADMIN_CREDENTIALS_MODIFIED",
      timestamp: new Date().toISOString(),
      details: `Administrator identity settings have been modified in the settings console. New Admin ID: ${idValue}, Associated Email: ${emailValue}.`,
      affectedCredentials: {
        adminId: idValue,
        email: emailValue
      }
    });

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filtering support ticket records
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || (
      statusFilter === 'active' ? !t.status.toLowerCase().includes('resolved') : t.status.toLowerCase().includes('resolved')
    );

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // OTP Auth URL for Google Authenticator App
  const otpAuthUri = `otpauth://totp/MotesEnvirotech:${customAdminEmail}?secret=${tempSecret}&issuer=MotesEnvirotech&algorithm=SHA1&digits=6&period=30`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpAuthUri)}`;

  return (
    <div className="min-h-[85vh] bg-slate-900 text-slate-100 flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500"></div>
      
      <div className="max-w-[1550px] mx-auto w-full flex-1 flex flex-col space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Secure Control Plane</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display mt-1">
              Industrial Administration Console
            </h1>
          </div>
          
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              {isMasterSession && (
                <span className="px-3 py-1 bg-amber-950 text-amber-400 font-mono text-[10px] rounded-lg border border-amber-900 flex items-center gap-1.5 font-bold animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> MASTER EMERGENCY BYPASS
                </span>
              )}
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 font-mono text-[10px] rounded-lg border border-emerald-900 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> SECURE SESSION
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </button>
            </div>
          )}
        </div>

        {/* NOT AUTHENTICATED: 2FA ENROLLMENT OR LOGIN CARD */}
        {!isLoggedIn ? (
          <div className="max-w-xl mx-auto w-full bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">

            {/* ERROR AND WARNING BANNER */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/50 border border-rose-900/60 text-rose-300 rounded-xl text-xs flex gap-2.5 items-start">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* WIZARD/FLOW CONTAINER */}
            {showEmergencyResetModal ? (
              <div className="space-y-5 text-xs">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2 animate-pulse" />
                  <h2 className="text-lg font-bold text-white font-display">Emergency Security Reset</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Verify the 6-digit TOTP code generated by the primary default email authenticator to revert all custom credentials and security keys to master defaults.
                  </p>
                </div>

                {resetError && (
                  <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 rounded-lg text-xs flex gap-2 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-900 text-[10.5px] font-mono text-slate-400">
                  <span className="text-slate-300 font-bold uppercase tracking-wide text-[9px] block mb-1">Target Identity</span>
                  <div className="space-y-0.5">
                    <div>• Default Email: <span className="text-emerald-400 font-semibold">{DEFAULT_ADMIN_CREDENTIALS.email}</span></div>
                    <div>• Recovery Secret: <span className="text-amber-500 font-semibold">MOTESADMINSECRET</span></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-semibold">6-Digit Primary Authenticator Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetTotpCode}
                    onChange={(e) => setResetTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full px-3 py-2.5 border border-slate-700 rounded-lg bg-slate-900 text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-mono text-slate-100 placeholder:text-xs placeholder:tracking-normal placeholder:font-normal"
                  />
                  <span className="text-[10px] text-slate-500 block leading-relaxed">
                    Verify using the Authenticator profile for the master default email. If correct, this will restore defaults and dispatch security alert logs.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmergencyResetModal(false);
                      setResetTotpCode('');
                      setResetError('');
                      setResetSuccess('');
                    }}
                    className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-850 text-slate-300 font-bold rounded-lg transition-all font-mono uppercase tracking-wider text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeEmergencySecurityReset}
                    className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg transition-all font-mono uppercase tracking-wider text-xs"
                  >
                    Verify & Revert
                  </button>
                </div>
              </div>
            ) : registeredAuthenticators.length === 0 ? (
              // CASE 1: 0 AUTHENTICATORS REGISTERED (1st Time Access or Both Disconnected) -> ID & PASSWORD
              <form onSubmit={handleVerifyAndLogin} className="space-y-5 text-xs">
                <div className="text-center">
                  <Lock className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <h2 className="text-lg font-bold text-white font-display">Administrator Log-In</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct ID & Password access (No authenticators currently registered).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 leading-relaxed text-[11px] flex gap-2.5 items-start">
                  <KeyRound className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-400 font-bold">1st-Time & Fallback Access Mode</strong>
                    <span>
                      Log in using your Administrator ID and Security Password. Once inside, visit the <strong>Settings</strong> tab to register your authenticator devices (up to 2 devices) to activate Authenticator-Only protection.
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-400 font-semibold">Administrator ID / Username</label>
                    <input
                      type="text"
                      required
                      value={adminIdInput}
                      onChange={(e) => setAdminIdInput(e.target.value)}
                      placeholder="Enter Admin ID (e.g. motes_admin)"
                      className="w-full px-3 py-2.5 border border-slate-700 rounded-lg bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-400 font-semibold">Security Password</label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full px-3 py-2.5 border border-slate-700 rounded-lg bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-slate-200"
                    />
                    <span className="text-[10px] text-slate-500 block leading-relaxed">
                      Default Master ID: <code className="text-slate-400">{DEFAULT_ADMIN_CREDENTIALS.adminId}</code>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-950/20 font-mono text-xs uppercase tracking-wider"
                >
                  Sign In With ID & Password
                </button>
              </form>
            ) : (
              // CASE 2: AT LEAST 1 AUTHENTICATOR REGISTERED -> AUTHENTICATOR-ONLY LOGIN
              <form onSubmit={handleVerifyAndLogin} className="space-y-5 text-xs">
                <div className="text-center">
                  <ShieldCheck className="h-10 w-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
                  <h2 className="text-lg font-bold text-white font-display">Authenticator Verification</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Authenticator-Only access active. Enter the 6-digit code from any registered device.
                  </p>
                </div>

                {/* Registered Devices chips */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400">
                    <span className="uppercase tracking-wide font-semibold">Registered Devices:</span>
                    <span className="text-cyan-400 font-bold">{registeredAuthenticators.length} of 2 Active</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {registeredAuthenticators.map((device, idx) => (
                      <span 
                        key={device.id} 
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-[11px] font-mono flex items-center gap-1.5"
                      >
                        <Smartphone className="h-3 w-3 text-cyan-400" />
                        <span className="font-semibold">{device.name}</span>
                        <span className="text-[9.5px] text-slate-500 font-normal">#{idx + 1}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold text-center">
                    6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    autoFocus
                    maxLength={6}
                    value={code2faInput}
                    onChange={(e) => setCode2faInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.35em] text-2xl font-mono px-3 py-3 border border-slate-700 rounded-xl bg-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-cyan-400 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block text-center">
                    Open Google Authenticator, Microsoft Authenticator, or your linked TOTP client.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-950/20 font-mono text-xs uppercase tracking-wider"
                >
                  Authorize System Session
                </button>
                
                <button
                  type="button"
                  onClick={handleResetSecurityConfiguration}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-rose-400 hover:underline transition-colors block pt-2"
                >
                  Lost all registered devices? Emergency Reset Credentials
                </button>
              </form>
            )}
          </div>
        ) : (
          // AUTHENTICATED: THE COMPREHENSIVE INDUSTRIAL ADMIN CONSOLE
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block px-3 pb-2 border-b border-slate-900 mb-2">Management Panel</span>
                
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                    activeTab === 'tickets' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Inquiry Tickets Queue</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    activeTab === 'tickets' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tickets.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                    activeTab === 'projects' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Manage Work Records</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    activeTab === 'projects' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {projectsList.length}
                  </span>
                </button>

                {/* Bio-Reactors & Telemetry: Marked not in use and removed from viewport per user instructions. Code is kept intact in activeTab === 'telemetry' render block. */}
                {/* 
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'telemetry' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Bio-Reactors & Telemetry</span>
                </button>
                */}

                 <button
                  onClick={() => setActiveTab('media')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                    activeTab === 'media' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>Site Media & Folders</span>
                  </span>
                  <span className="bg-slate-800 text-slate-400 group-hover:text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                    NEW
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'settings' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Corporate Site Config</span>
                </button>

                <button
                  onClick={() => setActiveTab('audit')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'audit' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Security Audit Logs</span>
                </button>
              </div>

              {/* INDUSTRIAL STATUS AT A GLANCE */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">System Status</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Main Outfall Aeration</span>
                    <span className="font-mono font-bold text-emerald-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Flow Telemetry Node</span>
                    <span className="font-mono font-bold text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Primary Sludge Pumps</span>
                    <span className="font-mono font-bold text-amber-400">AWAITING BIOMASS</span>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 flex flex-col gap-1 text-[10px] font-mono text-slate-500">
                  <div>Ref: EPC-DEL-022</div>
                  <div>Sync Period: 30s TOTP</div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT WORKSPACE */}
            <div className="lg:col-span-9 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 min-h-[500px]">
              
              {/* SUCCESS EVENT ALERT */}
              {successMsg && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-900/60 text-emerald-300 rounded-xl text-xs flex gap-2.5 items-start mb-6">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: TICKETS INTERACTIVE LIST */}
              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Technical Tickets Queue</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Edit, dispatch, and review client treatment inquiries directly.</p>
                    </div>
                    
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] font-bold rounded">
                      {filteredTickets.length} Matches found
                    </span>
                  </div>

                  {/* SEARCH & FILTER CONTROLS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative text-xs">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tickets..."
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-200"
                      />
                    </div>

                    <div className="relative text-xs">
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-300"
                      >
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical (Emergency)</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div className="relative text-xs">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-300"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active (Pending/Review)</option>
                        <option value="resolved">Completed / Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* TICKETS LIST GRID */}
                  {filteredTickets.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTickets.map(t => {
                        const hasNotes = t.message.includes('\n[Internal Engineering Notes]');
                        const rawMessage = hasNotes ? t.message.split('\n[Internal Engineering Notes]')[0] : t.message;
                        const notesValue = hasNotes ? t.message.split('\n[Internal Engineering Notes]: ')[1] : '';

                        return (
                          <div 
                            key={t.id} 
                            className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-emerald-500/20"
                          >
                            <div className="space-y-2.5 max-w-2xl text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-white text-[10px]">
                                  {t.id}
                                </span>
                                {t.priority === 'critical' ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold text-[9px] uppercase">CRITICAL</span>
                                ) : t.priority === 'high' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold text-[9px] uppercase">HIGH</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px] uppercase">{t.priority}</span>
                                )}
                                <span className="text-[10px] font-mono text-slate-500">{new Date(t.createdAt).toLocaleString()}</span>
                              </div>

                              <div>
                                <strong className="text-white text-sm block">{t.name}</strong>
                                <span className="text-slate-400 font-medium text-[11px]">{t.company} — <a href={`mailto:${t.email}`} className="text-cyan-400 hover:underline">{t.email}</a> | <a href={`tel:${t.phone}`} className="text-slate-400 hover:text-white">{t.phone}</a></span>
                              </div>

                              <p className="text-slate-300 leading-relaxed pt-2 border-t border-slate-850">
                                {rawMessage}
                              </p>

                              {hasNotes && (
                                <div className="mt-2 bg-slate-950 border border-cyan-950/40 p-3 rounded-xl">
                                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Internal Engineer Memo:</span>
                                  <span className="text-[11px] text-cyan-300 italic block mt-0.5">"{notesValue}"</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-row md:flex-col justify-end items-end gap-3 shrink-0 border-t md:border-t-0 border-slate-850 pt-4 md:pt-0">
                              <div className="text-right">
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Status</span>
                                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] font-bold rounded mt-1 inline-block">
                                  {t.status}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTicket(t);
                                    setNewStatus(t.status);
                                    setEngineerNotes(notesValue || '');
                                  }}
                                  className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-750 rounded-xl transition-all"
                                  title="Edit Ticket Status & Note"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(t.id)}
                                  className="p-2 bg-rose-950/20 hover:bg-rose-900 border border-rose-950/60 text-rose-400 hover:text-white rounded-xl transition-all"
                                  title="Archive Ticket"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      <Search className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                      <p className="font-semibold text-xs text-slate-400">No inquiry tickets found.</p>
                      <p className="text-[10px] text-slate-500 mt-1">Refine your search keywords or alter filter options.</p>
                    </div>
                  )}
                </div>
              )}

              {/* EDIT TICKET MODAL OVERLAY */}
              {editingTicket && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-white text-sm">Update Inquiry Review: {editingTicket.id}</h3>
                      <button 
                        onClick={() => setEditingTicket(null)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateTicketStatus} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Inquiry Ticket Client</label>
                        <input
                          type="text"
                          disabled
                          value={`${editingTicket.name} (${editingTicket.company})`}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Official Engineering Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                        >
                          <option value="Queued for Engineering Review">Queued for Engineering Review</option>
                          <option value="In-Progress: Site Inspection">In-Progress: Site Inspection</option>
                          <option value="O&M Dispatch Scheduled">O&M Dispatch Scheduled</option>
                          <option value="Awaiting Raw Discharge Metrics">Awaiting Raw Discharge Metrics</option>
                          <option value="Resolved: EPC Commissioned">Resolved: EPC Commissioned</option>
                          <option value="Archived / Inactive Request">Archived / Inactive Request</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Internal Engineer Notes (Memo)</label>
                        <textarea
                          rows={3}
                          value={engineerNotes}
                          onChange={(e) => setEngineerNotes(e.target.value)}
                          placeholder="Assign technician names, document soil sample pH test outcomes, or log physical discharge details..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-emerald-500 placeholder:text-slate-600"
                        ></textarea>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingTicket(null)}
                          className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-750 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
                        >
                          Commit Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 1.5: WORK RECORDS / EXPERIENCE MANAGER */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Manage Engineering Work Records</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Add, edit, delete, assign images, and update live operations statuses for all work orders.</p>
                    </div>
                    <button
                      onClick={() => {
                        resetProjectForm();
                        setIsAddingProject(true);
                      }}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Work Record</span>
                    </button>
                  </div>

                  {/* SEARCH, SORT & FILTERS BAR */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="relative md:col-span-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        placeholder="Search records by client, site details, location, or tech..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 md:col-span-4">
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">Sort By:</span>
                      <select
                        value={projectSortField}
                        onChange={(e) => setProjectSortField(e.target.value as any)}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono cursor-pointer"
                      >
                        <option value="id">Default (ID)</option>
                        <option value="fy">Year (Financial Year)</option>
                        <option value="tech">Technology</option>
                        <option value="status">Status</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setProjectSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="md:col-span-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white font-mono flex items-center justify-center gap-1.5 transition-all"
                      title="Toggle Sort Order"
                    >
                      <span>{projectSortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                  </div>

                  {/* RECORDS LIST CONTAINER */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-850 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            <th className="py-3 px-4 w-[100px]">FY Year</th>
                            <th className="py-3 px-4 w-[110px]">Technology</th>
                            <th className="py-3 px-4 w-[80px] text-center">Image</th>
                            <th className="py-3 px-4">Client, Site & Scope</th>
                            <th className="py-3 px-4 w-[140px]">Status</th>
                            <th className="py-3 px-4 text-right w-[110px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-xs text-slate-400">
                          {[...projectsList]
                            .filter(p => {
                              const search = projectSearchTerm.toLowerCase();
                              return (
                                p.client.toLowerCase().includes(search) ||
                                p.site.toLowerCase().includes(search) ||
                                p.location.toLowerCase().includes(search) ||
                                p.tech.toLowerCase().includes(search) ||
                                p.description.toLowerCase().includes(search)
                              );
                            })
                            .sort((a, b) => {
                              let comparison = 0;
                              if (projectSortField === 'id') {
                                comparison = a.id - b.id;
                              } else if (projectSortField === 'fy') {
                                const parseStartYear = (fyStr: string) => {
                                  const parts = fyStr.split(' - ');
                                  if (parts.length > 0) {
                                    const year = parseInt(parts[0], 10);
                                    if (!isNaN(year)) return year;
                                  }
                                  return 0;
                                };
                                comparison = parseStartYear(a.fy) - parseStartYear(b.fy);
                                if (comparison === 0) {
                                  comparison = a.id - b.id;
                                }
                              } else if (projectSortField === 'tech') {
                                comparison = a.tech.localeCompare(b.tech);
                              } else if (projectSortField === 'status') {
                                comparison = a.status.localeCompare(b.status);
                              }
                              return projectSortOrder === 'asc' ? comparison : -comparison;
                            })
                            .map((proj) => (
                              <tr key={proj.id} className="hover:bg-slate-900/50 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                                  {proj.fy}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] font-semibold">
                                    {proj.tech}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {(() => {
                                    const imgUrl = getProjectImageDynamic(proj);
                                    return (
                                      <div className="relative group inline-block">
                                        <img 
                                          src={imgUrl} 
                                          alt={proj.client} 
                                          className="h-9 w-9 rounded object-cover border border-slate-800"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute hidden group-hover:block bottom-11 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 p-1.5 rounded shadow-xl z-20">
                                          <img 
                                            src={imgUrl} 
                                            alt={proj.client} 
                                            className="max-w-[140px] max-h-[140px] object-cover rounded"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="py-3.5 px-4 max-w-sm">
                                  <div className="space-y-0.5">
                                    <strong className="block text-slate-100 text-xs font-semibold">{proj.client}</strong>
                                    <span className="block text-[11px] text-slate-400 font-medium">{proj.site}</span>
                                    <span className="block text-[10px] text-slate-500">{proj.location}</span>
                                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-1 mt-1 italic">{proj.description}</p>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  {proj.status === 'Completed' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-mono font-bold">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Completed
                                    </span>
                                  ) : proj.status === 'Ongoing' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-900 text-[10px] font-mono font-bold animate-pulse">
                                      <Clock className="h-3 w-3" />
                                      Ongoing
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-900 text-[10px] font-mono font-bold">
                                      <Server className="h-3 w-3" />
                                      Commissioning
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditProjectClick(proj)}
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded transition-colors"
                                      title="Edit Record"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProject(proj.id, proj.client)}
                                      className="p-1.5 bg-slate-900 hover:bg-rose-955 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 rounded transition-colors"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ADD PROJECT MODAL OVERLAY */}
              {isAddingProject && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-white text-sm">Add Wastewater Engineering Record</h3>
                      <button 
                        onClick={() => setIsAddingProject(false)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddProject} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-slate-400 font-semibold">Financial Year (FY)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2024 - 2025"
                            value={projFy}
                            onChange={(e) => setProjFy(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-mono outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-400 font-semibold">Technology Category</label>
                          <select
                            value={projTech}
                            onChange={(e) => setProjTech(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-mono outline-none"
                          >
                            <option value="SBR">SBR (Sequencing Batch Reactor)</option>
                            <option value="MBR">MBR (Membrane Bioreactor)</option>
                            <option value="MBBR">MBBR (Moving Bed Bio-Reactor)</option>
                            <option value="ASP">ASP (Activated Sludge Process)</option>
                            <option value="O&M">O&M (Operations & Maintenance)</option>
                            <option value="Sewer">Sewer & Cleaning Works</option>
                            <option value="Civil">Civil Construction</option>
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Client Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Municipal Corporation of Gurugram"
                          value={projClient}
                          onChange={(e) => setProjClient(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Site / Plant Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 15 MLD STP, Dhanwapur"
                          value={projSite}
                          onChange={(e) => setProjSite(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none font-semibold"
                        />
                      </div>

                      {/* Structured Location Details */}
                      <div className="space-y-3 bg-slate-950/30 p-3.5 border border-slate-850 rounded-2xl">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Structured Location Details</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">Country</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. India"
                              value={projCountry}
                              onChange={(e) => setProjCountry(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">State</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Haryana"
                              value={projState}
                              onChange={(e) => setProjState(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">District</label>
                            <input
                              type="text"
                              placeholder="e.g. Gurugram"
                              value={projDistrict}
                              onChange={(e) => setProjDistrict(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">City</label>
                            <input
                              type="text"
                              placeholder="e.g. Dhanwapur"
                              value={projCity}
                              onChange={(e) => setProjCity(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="block text-slate-400 font-semibold">Area / Zone</label>
                            <input
                              type="text"
                              placeholder="e.g. Sector 15"
                              value={projArea}
                              onChange={(e) => setProjArea(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Operations Scope / Description</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Document the technical scope, biological standards achieved, and operations performed..."
                          value={projDescription}
                          onChange={(e) => setProjDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Active Engineering Status</label>
                        <select
                          value={projStatus}
                          onChange={(e) => setProjStatus(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                        >
                          <option value="Completed">Completed (Fully Operational)</option>
                          <option value="Ongoing">Ongoing (O&M Active)</option>
                          <option value="Under Commissioning">Under Commissioning (EPC Phase)</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl transition-all font-mono text-[10px] uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-750 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all font-mono text-[10px] uppercase"
                        >
                          Create Record
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* EDIT PROJECT MODAL OVERLAY */}
              {editingProject && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-white text-sm">Edit Wastewater Engineering Record</h3>
                      <button 
                        onClick={() => setEditingProject(null)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProject} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-slate-400 font-semibold">Financial Year (FY)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2024 - 2025"
                            value={projFy}
                            onChange={(e) => setProjFy(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-mono outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-400 font-semibold">Technology Category</label>
                          <select
                            value={projTech}
                            onChange={(e) => setProjTech(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-mono outline-none"
                          >
                            <option value="SBR">SBR (Sequencing Batch Reactor)</option>
                            <option value="MBR">MBR (Membrane Bioreactor)</option>
                            <option value="MBBR">MBBR (Moving Bed Bio-Reactor)</option>
                            <option value="ASP">ASP (Activated Sludge Process)</option>
                            <option value="O&M">O&M (Operations & Maintenance)</option>
                            <option value="Sewer">Sewer & Cleaning Works</option>
                            <option value="Civil">Civil Construction</option>
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Client Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Municipal Corporation of Gurugram"
                          value={projClient}
                          onChange={(e) => setProjClient(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Site / Plant Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 15 MLD STP, Dhanwapur"
                          value={projSite}
                          onChange={(e) => setProjSite(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none font-semibold"
                        />
                      </div>

                      {/* Structured Location Details */}
                      <div className="space-y-3 bg-slate-950/30 p-3.5 border border-slate-850 rounded-2xl">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Structured Location Details</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">Country</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. India"
                              value={projCountry}
                              onChange={(e) => setProjCountry(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">State</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Haryana"
                              value={projState}
                              onChange={(e) => setProjState(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">District</label>
                            <input
                              type="text"
                              placeholder="e.g. Gurugram"
                              value={projDistrict}
                              onChange={(e) => setProjDistrict(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">City</label>
                            <input
                              type="text"
                              placeholder="e.g. Dhanwapur"
                              value={projCity}
                              onChange={(e) => setProjCity(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="block text-slate-400 font-semibold">Area / Zone</label>
                            <input
                              type="text"
                              placeholder="e.g. Sector 15"
                              value={projArea}
                              onChange={(e) => setProjArea(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Operations Scope / Description</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Document the technical scope, biological standards achieved, and operations performed..."
                          value={projDescription}
                          onChange={(e) => setProjDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Active Engineering Status</label>
                        <select
                          value={projStatus}
                          onChange={(e) => setProjStatus(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                        >
                          <option value="Completed">Completed (Fully Operational)</option>
                          <option value="Ongoing">Ongoing (O&M Active)</option>
                          <option value="Under Commissioning">Under Commissioning (EPC Phase)</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl transition-all font-mono text-[10px] uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-750 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all font-mono text-[10px] uppercase"
                        >
                          Commit Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: METRICS & TELEMETRY */}
              {activeTab === 'telemetry' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Bio-Reactors & Wastewater Telemetry</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Live SCADA feed tracking active treatment cycles and sludge densities.</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                      <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                      Updated: {lastTelemetryUpdate}
                    </span>
                  </div>

                  {/* DIGITAL STATS TELEMETRY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Water Discharge Flow</span>
                      <strong className="block text-xl font-extrabold text-white mt-1 font-mono">{waterFlow} m³/h</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">Within Safe Threshold</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Biological pH Balance</span>
                      <strong className="block text-xl font-extrabold text-white mt-1 font-mono">{phLevel} pH</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">Optimal Microbial Yield</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Dissolved Oxygen (DO)</span>
                      <strong className="block text-xl font-extrabold text-white mt-1 font-mono">{dissolvedOxygen} mg/L</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">Aerator Cycle Normal</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Biomass Sludge Load</span>
                      <strong className="block text-xl font-extrabold text-white mt-1 font-mono">{biomassLoad}%</strong>
                      <span className="text-[10px] text-amber-400 block mt-0.5 font-mono">Decanting Recommended</span>
                    </div>

                  </div>

                  {/* TELEMETRY CHART PAIRINGS (RAW HAND-CRAFTED COMPATIBLE SCADA PANELS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold border-b border-slate-850 pb-2">Effluent Treatment Capacity Trend (24h)</h4>
                      
                      <div className="h-44 w-full flex items-end justify-between gap-1.5 pt-4">
                        {[40, 52, 61, 58, 72, 85, 91, 88, 76, 80, 84, 94].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <span className="text-[9px] font-mono text-cyan-400 font-bold scale-0 group-hover:scale-100 transition-transform duration-200">{val}</span>
                            <div 
                              className="w-full bg-gradient-to-t from-teal-900 to-cyan-500 rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                              style={{ height: `${val}%` }}
                            ></div>
                            <span className="text-[8px] font-mono text-slate-500">{idx * 2}h</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 block text-center font-mono">Hourly wastewater processed peak capacity index</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold border-b border-slate-850 pb-2">BOD/TSS Reduction Rate</h4>
                      
                      <div className="space-y-4 pt-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">Biological Oxygen Demand (BOD) Reduction</span>
                            <span className="text-emerald-400 font-bold">98.4%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.4%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">Total Suspended Solids (TSS) Reduction</span>
                            <span className="text-emerald-400 font-bold">97.1%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '97.1%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">Heavy Metal Remediation Efficiency</span>
                            <span className="text-cyan-400 font-bold">89.5%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '89.5%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2.5: SITE MEDIA & FOLDERS */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-4">
                    <h2 className="text-lg font-bold text-white font-display">Site Media & Directory Folders</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage directory folders and upload photos for each project. Assets are prepared for backend integration & database persistence.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* LEFT PANEL: DIRECTORY CONTROLS & CONFIGS */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* SITE DIRECTORIES LIST */}
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                            <FolderOpen className="h-3.5 w-3.5 text-emerald-400" />
                            Site Directories
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {folders.length} Folders
                          </span>
                        </div>

                        {/* Folder List - Nested Hierarchical Directory Tree Explorer */}
                        <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                          {visibleTreeRows.map((row) => {
                            const isSelectedLeaf = row.isLeaf && selectedFolder === row.fullName;
                            const indentClass = row.level === 0 ? 'pl-2' : 
                                                row.level === 1 ? 'pl-4' : 
                                                row.level === 2 ? 'pl-7' : 
                                                row.level === 3 ? 'pl-10' : 'pl-12';
                            
                            return (
                              <button
                                key={row.id}
                                type="button"
                                onClick={() => {
                                  if (row.isLeaf) {
                                    setSelectedFolder(row.fullName);
                                  } else {
                                    setExpandedPaths(prev => ({
                                      ...prev,
                                      [row.id]: !prev[row.id]
                                    }));
                                  }
                                }}
                                className={`w-full flex items-center justify-between gap-2.5 py-2 px-2.5 rounded-xl text-left transition-all border font-mono text-[11px] group ${indentClass} ${
                                  isSelectedLeaf
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60 font-medium shadow-md'
                                    : row.isLeaf
                                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/20 border-transparent font-medium'
                                }`}
                              >
                                <span className="flex items-center gap-2 min-w-0 flex-1">
                                  {/* Expand/Collapse icon for non-leaf parent nodes */}
                                  {!row.isLeaf ? (
                                    <span className="text-slate-500 group-hover:text-slate-350 transition-colors">
                                      {row.isExpanded ? (
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                      ) : (
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                      )}
                                    </span>
                                  ) : (
                                    <span className="w-3.5 shrink-0"></span>
                                  )}

                                  {/* Folder/File Icon */}
                                  {row.isLeaf ? (
                                    <FileImage className={`h-3.5 w-3.5 shrink-0 ${isSelectedLeaf ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                  ) : row.isExpanded ? (
                                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500/80 group-hover:text-amber-400" />
                                  ) : (
                                    <Folder className="h-3.5 w-3.5 shrink-0 text-amber-600/70 group-hover:text-amber-500" />
                                  )}

                                  {/* Directory Name with level visual indicators */}
                                  <span className="truncate block leading-tight text-slate-200 group-hover:text-white">
                                    {row.name}
                                    {!row.isLeaf && (
                                      <span className="text-[8px] text-slate-500 ml-1.5 uppercase font-sans tracking-wider font-normal bg-slate-950/80 border border-slate-900 px-1 py-0.2 rounded">
                                        {row.level === 0 ? 'State' :
                                         row.level === 1 ? 'District' :
                                         row.level === 2 ? 'City' : 'Area'}
                                      </span>
                                    )}
                                  </span>
                                </span>

                                {/* Right indicator: image count for leaf */}
                                {row.isLeaf && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950/60 border border-slate-850 rounded text-slate-500 shrink-0">
                                    {row.imageCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Create Directory Form */}
                        <form onSubmit={handleAddFolder} className="pt-2 border-t border-slate-800/60 space-y-2">
                          <label className="block text-[10px] text-slate-500 font-mono uppercase font-semibold">Create New Site Folder</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              placeholder="e.g. Pune STP Phase 2"
                              className="flex-1 px-3 py-2 border border-slate-800 bg-slate-950/60 text-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs font-mono"
                            />
                            <button
                              type="submit"
                              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-all"
                              title="Create Folder"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* GLOBAL DEFAULT FALLBACK CONFIG */}
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                        <div className="border-b border-slate-800 pb-2">
                          <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                            <Image className="h-3.5 w-3.5 text-emerald-400" />
                            Default Site Fallback
                          </h3>
                        </div>

                        <form onSubmit={handleSaveDefaultFallbackImage} className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-slate-500 font-mono uppercase font-semibold">Fallback Image URL</label>
                            <input
                              type="text"
                              value={defaultSiteImage}
                              onChange={(e) => setDefaultSiteImage(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs font-mono"
                              placeholder="Direct Image URL"
                            />
                          </div>

                          {/* Fallback Preview */}
                          {defaultSiteImage.trim() && (
                            <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950 aspect-video relative group">
                              <img
                                src={defaultSiteImage}
                                alt="Default site fallback preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-emerald-400 font-mono font-semibold border border-emerald-900/40">
                                ACTIVE DEFAULT PREVIEW
                              </div>
                            </div>
                          )}

                          <div className="pt-1.5 space-y-2">
                            <button
                              type="submit"
                              className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-all font-mono text-[10px] uppercase font-bold tracking-wider"
                            >
                              Commit Default Fallback
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyDefaultToImageless}
                              className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-emerald-800/50 rounded-xl transition-all font-mono text-[10px] uppercase font-bold"
                            >
                              Apply to Imageless Sites
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* STORAGE CAPACITY ESTIMATE CARD */}
                      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                            Storage Pool Capacity
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">0.3% Used</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '0.3%' }}></div>
                        </div>
                        <div className="flex justify-between font-mono text-[9px] text-slate-500">
                          <span>16.8 MB uploaded</span>
                          <span>5.0 GB Max Pool</span>
                        </div>
                      </div>

                      {/* BACKEND DEPLOYMENT ROADMAP */}
                      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3">
                        <div className="border-b border-slate-900 pb-2">
                          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Future Backend Roadmap</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Designed for seamless integration with express file systems and persistent metadata storage.
                        </p>
                        <div className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-900 space-y-2 font-mono text-[9px] text-slate-500">
                          <div>
                            <span className="text-emerald-500 block font-bold">// multer directory mapper</span>
                            <span className="text-slate-400">dest: './uploads/sites/' + folderName</span>
                          </div>
                          <div>
                            <span className="text-emerald-500 block font-bold">// drizzle relation key</span>
                            <span className="text-slate-400">table.image_url = path.join(dest, file);</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: SPACIOUS DIRECTORY MEDIA GALLERY & UPLOADER */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-6 flex flex-col h-full min-h-[680px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                              {selectedFolder} Contents
                            </h3>
                          </div>
                          <span className="text-xs text-slate-400 font-mono bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-lg">
                            {(folderImages[selectedFolder] || []).length} media items
                          </span>
                        </div>

                        {/* Compact Table/List View of Images */}
                        <div className="flex-1 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin">
                          {(folderImages[selectedFolder] || []).length > 0 ? (
                            <div className="space-y-2">
                              {(folderImages[selectedFolder] || []).map((img, idx) => (
                                <div 
                                  key={idx} 
                                  draggable={true}
                                  onDragStart={(e) => handlePhotoDragStart(e, idx)}
                                  onDragOver={(e) => handlePhotoDragOver(e, idx)}
                                  onDrop={(e) => handlePhotoDrop(e, idx)}
                                  onDragEnd={handlePhotoDragEnd}
                                  className={`group flex items-center justify-between p-3.5 bg-slate-950/65 border border-slate-850 hover:border-emerald-500/40 rounded-xl transition-all font-mono text-[11px] cursor-grab active:cursor-grabbing ${
                                    draggedPhotoIndex === idx 
                                      ? 'opacity-45 border-dashed border-emerald-500 bg-emerald-950/20' 
                                      : 'hover:bg-slate-900/40'
                                  }`}
                                  title="Grab and drag to reorder photos"
                                >
                                  {/* Left section: file name as clickable link */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="text-slate-600 hover:text-slate-400 group-hover:text-slate-400 p-0.5 shrink-0 transition-colors" title="Drag to reorder">
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0">
                                      <FileImage className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImage(img)}
                                        className="text-left text-slate-200 hover:text-emerald-400 hover:underline font-bold truncate max-w-[200px] sm:max-w-[320px] block transition-colors"
                                        title="Click to pop up photo"
                                      >
                                        {img.name}
                                      </button>
                                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 font-normal">
                                        Added on {img.date}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right section: metadata & action buttons */}
                                  <div className="flex items-center gap-4 ml-4">
                                    <span className="text-[9px] text-slate-400 font-mono bg-slate-900 border border-slate-850 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                                      {img.size}
                                    </span>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImage(img)}
                                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors border border-slate-800"
                                        title="Preview Image popup"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(img.url);
                                          alert('Image URL copied to clipboard!');
                                        }}
                                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors border border-slate-800"
                                        title="Copy Direct URL"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          if (window.confirm(`Delete "${img.name}" from directory?`)) {
                                            setFolderImages(prev => {
                                              const list = prev[selectedFolder] || [];
                                              const updatedImages = {
                                                ...prev,
                                                [selectedFolder]: list.filter((_, i) => i !== idx)
                                              };
                                              localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(updatedImages));
                                              window.dispatchEvent(new Event('motes_media_folder_images_updated'));
                                              return updatedImages;
                                            });
                                            addAuditLog(`Deleted image "${img.name}" from directory "${selectedFolder}"`);
                                          }
                                        }}
                                        className="p-1.5 bg-rose-955/15 hover:bg-rose-950/45 text-rose-400 hover:text-rose-300 rounded-lg transition-colors border border-rose-900/20"
                                        title="Delete Asset"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-650 space-y-3">
                              <div className="p-4 bg-slate-950 border border-slate-900 rounded-full">
                                <FileImage className="h-8 w-8 text-slate-600" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-semibold text-slate-400 block">No images in directory</span>
                                <span className="text-xs text-slate-500 font-mono block">Add image link or upload files for {selectedFolder}.</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dual-Method Image Adding Section */}
                        <div className="pt-6 border-t border-slate-800/60 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-1.5">
                              <Plus className="h-3.5 w-3.5 text-emerald-400" />
                              Add Photo to {selectedFolder}
                            </span>
                            
                            {/* Method Selector Tabs */}
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setImageAddMethod('upload')}
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                                  imageAddMethod === 'upload'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Local Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => setImageAddMethod('url')}
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                                  imageAddMethod === 'url'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Direct URL Link
                              </button>
                            </div>
                          </div>

                          {imageAddMethod === 'upload' ? (
                            /* Method A: Local File Upload */
                            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-700/80 bg-slate-950/40 hover:bg-slate-900/20 rounded-2xl p-6 cursor-pointer transition-all text-center">
                              <Upload className="h-8 w-8 text-emerald-500 mb-2 animate-pulse" />
                              <span className="text-sm font-semibold text-slate-200">Drag & Drop Site Photo here</span>
                              <span className="text-xs text-slate-400 font-mono mt-1">Or click to browse your local filesystem</span>
                              
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleSimulatedUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </label>
                          ) : (
                            /* Method B: Direct URL Input */
                            <form onSubmit={handleAddPhotoByUrl} className="bg-slate-950/30 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-mono uppercase font-semibold">Image URL Link</label>
                                  <input
                                    type="url"
                                    required
                                    value={inputImageUrl}
                                    onChange={(e) => setInputImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/... or raw image URL"
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-xs font-mono text-slate-200 placeholder:text-slate-650"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-mono uppercase font-semibold">Custom File/Photo Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={inputImageName}
                                    onChange={(e) => setInputImageName(e.target.value)}
                                    placeholder="e.g. primary_aerator.jpg"
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-xs font-mono text-slate-200 placeholder:text-slate-650"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="submit"
                                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Photo Link
                                </button>
                              </div>
                            </form>
                          )}
                        </div>

                        {/* Upload Status Area */}
                        {uploadQueue.length > 0 && (
                          <div className="space-y-3 border-t border-slate-800/60 pt-4">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Active Upload Queue</span>
                            <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                              {uploadQueue.map((task) => (
                                <div key={task.id} className="bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-2 text-[11px] font-mono">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-300 truncate font-semibold block max-w-[280px]">{task.name}</span>
                                    <span className={`text-[10px] font-bold ${
                                      task.status === 'completed' ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'
                                    }`}>
                                      {task.status === 'completed' ? 'COMPLETED' : `${task.progress}%`}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        task.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500'
                                      }`}
                                      style={{ width: `${task.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                                    <span>Size: {task.size}</span>
                                    <span>Target Dir: /{selectedFolder}/</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS CONFIG */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-4">
                    <h2 className="text-lg font-bold text-white font-display">Corporate Site Configurations</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Override contact information and system alerts dynamically in the client viewport.</p>
                  </div>

                  <form onSubmit={handleSaveSystemConfig} className="space-y-5 text-xs max-w-xl">
                    <div className="space-y-1">
                      <label className="block text-slate-400 font-semibold">Active Corporate Phone Line</label>
                      <input
                        type="text"
                        value={corpPhone}
                        onChange={(e) => setCorpPhone(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-slate-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400 font-semibold">Official Public Contact Email</label>
                      <input
                        type="email"
                        value={corpEmail}
                        onChange={(e) => setCorpEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-slate-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400 font-semibold">System Outfall Alert Level Banner</label>
                      <select
                        value={alertState}
                        onChange={(e) => setAlertState(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 text-slate-300 font-mono font-semibold"
                      >
                        <option value="Normal Operational">Normal Operational (Fully Compliant)</option>
                        <option value="Maintenance Advisory">Maintenance Advisory (Reduced Decanting)</option>
                        <option value="Process Alarm: Check Aeration Loads">Process Alarm: Check Aeration Loads</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-6 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all font-mono text-xs uppercase tracking-wider"
                    >
                      Commit Configurations
                    </button>
                  </form>

                  {/* ADMINISTRATOR ACCESS CREDENTIALS CONFIGURATION */}
                  <div className="border-t border-slate-900 pt-6 space-y-4 max-w-xl">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <KeyRound className="h-4 w-4 text-emerald-400" />
                        Administrator Identity & Credentials Configuration
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Customize the primary credentials needed to access the Control Panel. Updating these values will change the required Admin ID and security passphrase. It will also update the user email encoded in the Google Authenticator 2FA QR code.
                      </p>
                    </div>

                    <form onSubmit={handleSaveSecurityConfig} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Custom Administrator Username / ID</label>
                        <input
                          type="text"
                          required
                          value={customAdminId}
                          onChange={(e) => setCustomAdminId(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 font-mono text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Custom Administrator Email (For 2FA QR Code & Alerts)</label>
                        <input
                          type="email"
                          required
                          value={customAdminEmail}
                          onChange={(e) => setCustomAdminEmail(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 font-mono text-slate-200"
                        />
                        <span className="text-[10px] text-slate-500 block leading-relaxed">
                          Your Google Authenticator app will show this email when you scan the 2FA enrollment code.
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-400 font-semibold">Custom Security Passphrase / Password</label>
                        <input
                          type="text"
                          required
                          value={customPassphrase}
                          onChange={(e) => setCustomPassphrase(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-800 bg-slate-900 rounded-xl outline-none focus:border-emerald-500 font-mono text-slate-200"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-700/55 text-emerald-400 font-bold rounded-xl transition-all font-mono text-xs uppercase tracking-wider"
                      >
                        Commit Identity Changes
                      </button>
                    </form>
                  </div>

                  {/* REGISTERED AUTHENTICATOR DEVICES (MAX 2) */}
                  <div className="border-t border-slate-900 pt-6 space-y-4 max-w-xl animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                          <Smartphone className="h-4 w-4 text-cyan-400" />
                          Registered Authenticator Devices
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          Maximum 2 authenticator devices allowed. When at least 1 device is registered, login strictly mandates 6-digit authenticator verification. If both are disconnected, login automatically falls back to ID & Password.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          registeredAuthenticators.length >= 2
                            ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                            : registeredAuthenticators.length === 1
                            ? 'bg-cyan-950/30 border-cyan-800/60 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {registeredAuthenticators.length} / 2 Slots Used
                        </span>
                      </div>
                    </div>

                    {/* Devices list */}
                    <div className="space-y-2.5">
                      {registeredAuthenticators.length === 0 ? (
                        <div className="p-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                          <KeyRound className="h-6 w-6 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400 font-semibold">No authenticator devices are currently registered.</p>
                          <p className="text-[10.5px] text-slate-500 max-w-md mx-auto leading-relaxed">
                            Currently operating in fallback ID & Password access mode. Register up to 2 devices (e.g. Primary phone, backup tablet, or YubiKey/Authenticator) to enforce Authenticator-Only protection for your control panel.
                          </p>
                        </div>
                      ) : (
                        registeredAuthenticators.map((auth, idx) => (
                          <div 
                            key={auth.id}
                            className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0">
                                <Smartphone className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-100 truncate">{auth.name}</h4>
                                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                    Slot #{idx + 1}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  Enrolled: {new Date(auth.createdAt).toLocaleDateString()} at {new Date(auth.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setViewingAuth(auth)}
                                className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 rounded-lg text-[10.5px] font-mono font-medium transition-all flex items-center gap-1"
                                title="View QR Code & Secret"
                              >
                                <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                                <span className="hidden sm:inline">View QR</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnectDevice(auth.id)}
                                className="px-2.5 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/50 rounded-lg text-[10.5px] font-mono font-medium transition-all flex items-center gap-1"
                                title="Disconnect Device"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                <span>Disconnect</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Action button / Status */}
                    <div>
                      {registeredAuthenticators.length < 2 ? (
                        <button
                          type="button"
                          onClick={handleOpenAddDevice}
                          className="w-full sm:w-auto py-2.5 px-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                          Add Authenticator Device ({registeredAuthenticators.length}/2)
                        </button>
                      ) : (
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span>Maximum limit reached: 2 of 2 devices registered.</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                            Disconnect a slot to register a new device
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CREDENTIALS BACKUP & RESTORE */}
                  <div className="border-t border-slate-900 pt-6 space-y-4 max-w-xl animate-fadeIn">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <HardDrive className="h-4 w-4 text-cyan-400" />
                      Credential Backup & Local Recovery
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Export your active administrative identity settings (including password, custom ID, email, and 2FA secrets) to a secure local file, or import a previously saved state to restore access after a system reset.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Export Options */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Secure Backup Export</span>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={handleExportCredentials}
                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-700 text-cyan-400 font-bold rounded-xl transition-all font-mono text-[10.5px] uppercase flex items-center justify-center gap-2"
                          >
                            <Upload className="h-4 w-4 transform rotate-180" /> Export Backup File
                          </button>
                        </div>
                      </div>

                      {/* Import Options */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Local Backup Recovery</span>
                        <label className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-700 text-cyan-400 font-bold rounded-xl transition-all font-mono text-[10.5px] uppercase flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="h-4 w-4" /> Import Backup File
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportCredentials}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* SECURITY RESET BLOCK */}
                  <div className="border-t border-slate-900 pt-6 space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                      Security Credentials Core Reset
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      If you've lost your original authenticator device or need to refresh compliance certificates, click below to wipe the configuration key clean.
                    </p>
                    <button
                      onClick={handleResetSecurityConfiguration}
                      className="py-2.5 px-4 bg-rose-950/20 hover:bg-rose-950 text-rose-300 border border-rose-900 rounded-xl transition-all font-mono text-[10px] uppercase font-bold"
                    >
                      Hard Reset Authenticator (TOTP) Settings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Security Audit Logs</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Chronological system telemetry logs tracking access, logins, and configurations.</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all logs?')) {
                          setAuditLogs([]);
                          localStorage.removeItem('motes_admin_audit_logs');
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-500 hover:text-rose-400 font-mono text-[10px] font-bold rounded"
                    >
                      Clear Audit Log
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 max-h-[400px] overflow-y-auto font-mono text-xs text-slate-400 space-y-2.5">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log, idx) => (
                        <div 
                          key={idx} 
                          className="py-2 border-b border-slate-900/60 flex items-start gap-2.5 last:border-0 hover:text-slate-200 transition-colors"
                        >
                          <span className="text-emerald-500">▶</span>
                          <span>{log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-600">
                        No telemetry logs registered for this workspace session.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* Dynamic Photo Preview Modal Popup */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full flex flex-col space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-white font-mono">{previewImage.name}</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 relative">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[60vh] max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.postimg.cc/tTn7YWZ8/DEFAULT.png";
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Secure Backup & Restore Passcode Modal Overlay */}
      {showBackupPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full flex flex-col space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-xs">
            <button
              onClick={() => {
                setShowBackupPasswordModal(false);
                setPendingImportFile(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-850">
              <HardDrive className="h-5 w-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white font-display">
                {backupMode === 'export' ? 'Secure Backup Export' : 'Local Backup Recovery'}
              </h3>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              {backupMode === 'export' 
                ? 'Your credentials backup contains highly sensitive passphrases and 2FA secrets. Please establish an encryption password below to secure your file.'
                : 'Enter the password that was established when this secure backup file was exported to decrypt and restore the administrator identity.'}
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (backupMode === 'export') {
                  executeExport();
                } else {
                  executeImport();
                }
              }} 
              className="space-y-4 pt-1"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-500 font-mono uppercase font-semibold">
                  {backupMode === 'export' ? 'Set Backup Password' : 'Enter Decryption Password'}
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder={backupMode === 'export' ? 'Create high-entropy password' : 'Enter recovery password'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-cyan-500 text-xs font-mono text-slate-200 placeholder:text-slate-700"
                />
              </div>

              {backupModalError && (
                <div className="bg-rose-950/20 border border-rose-900/60 text-rose-400 p-2.5 rounded-xl flex items-start gap-1.5 font-mono text-[10px] leading-normal animate-fadeIn">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{backupModalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupPasswordModal(false);
                    setPendingImportFile(null);
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl font-mono text-[10px] font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  {backupMode === 'export' ? 'Encrypt & Export' : 'Decrypt & Restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW AUTHENTICATOR DEVICE (MAX 2) */}
      {showAddAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Register Authenticator</h3>
                  <p className="text-[11px] text-cyan-400 font-mono">Slot #{registeredAuthenticators.length + 1} of 2 Allowed</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAuthModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyAndSaveDevice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Device Friendly Name</label>
                <input
                  type="text"
                  required
                  value={newAuthName}
                  onChange={(e) => setNewAuthName(e.target.value)}
                  placeholder="e.g. Primary iPhone, Office YubiKey, Android Pixel"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl outline-none focus:border-cyan-500 font-mono text-slate-200 text-xs"
                />
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl w-[190px] h-[190px] mx-auto flex items-center justify-center border border-slate-300 shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(`otpauth://totp/MotesEnvirotech:${customAdminEmail}?secret=${newAuthSecret}&issuer=MotesEnvirotech&algorithm=SHA1&digits=6&period=30`)}`} 
                  alt="2FA QR Code" 
                  className="w-[170px] h-[170px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-[10.5px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Account Label:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[190px]">{customAdminEmail}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Secret Key:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 font-bold select-all tracking-wider">{newAuthSecret}</span>
                    <button
                      type="button"
                      onClick={handleCopyNewAuthSecret}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      title="Copy Secret"
                    >
                      {newAuthCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold text-center">
                  Enter 6-Digit Code from Authenticator to Confirm
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAuthVerifyCode}
                  onChange={(e) => setNewAuthVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.3em] text-xl font-mono px-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-cyan-400 font-bold"
                />
                <span className="text-[10px] text-slate-500 block text-center">
                  Device must verify with a live 6-digit TOTP code before it is saved.
                </span>
              </div>

              {newAuthError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-xl text-xs flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{newAuthError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAuthModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-mono text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  Verify & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW EXISTING AUTHENTICATOR QR & DETAILS */}
      {viewingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">{viewingAuth.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Enrolled {new Date(viewingAuth.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAuth(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-2xl w-[190px] h-[190px] mx-auto flex items-center justify-center border border-slate-300 shadow-md">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(`otpauth://totp/MotesEnvirotech:${customAdminEmail}?secret=${viewingAuth.secret}&issuer=MotesEnvirotech&algorithm=SHA1&digits=6&period=30`)}`} 
                alt="2FA QR Code" 
                className="w-[170px] h-[170px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-[10.5px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Label:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[190px]">{customAdminEmail}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Secret Key:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold select-all tracking-wider">{viewingAuth.secret}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyViewingAuthSecret(viewingAuth.secret)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy Secret"
                  >
                    {viewingAuthCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewingAuth(null)}
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl font-mono text-xs font-bold uppercase transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
