'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  Users,
  Mail,
  FileText,
  Layers,
  Activity,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Heart,
  MessageCircle,
  Play,
  UserPlus,
  Send,
  Eye,
  Settings,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

type Totals = { type: string; _count: { type: number } }[];
type Event = {
  id: string;
  type: string;
  createdAt: string;
  metadata?: Record<string, any>;
  user?: { email: string | null; name: string | null };
  audio?: { title: string | null };
};

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipients: number;
  createdAt: string;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string | null;
  variables?: Record<string, any> | null;
  updatedAt: string;
};

type SequenceStep = {
  id?: string;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
};

type Sequence = {
  id: string;
  name: string;
  description?: string | null;
  trigger: string;
  active: boolean;
  steps: SequenceStep[];
  updatedAt: string;
};

type Deal = {
  id: string;
  contactId: string;
  title: string;
  value?: number | null;
  stage: string;
  contact?: { email: string; name?: string | null };
};

type Contact = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  tags?: { tag: { id: string; name: string; color?: string | null } }[];
  deals?: { id: string; stage: string; title: string }[];
  events?: { id: string; type: string; createdAt: string }[];
  updatedAt: string;
};

type Tag = {
  id: string;
  name: string;
  color?: string | null;
};

type MetaConfig = {
  pixelId?: string;
  capiEnabled?: boolean;
  accessToken?: string;
};

type Automation = {
  id: string;
  name: string;
  trigger: string;
  delayMinutes: number;
  subject: string;
  body: string;
  active: boolean;
  templateId?: string | null;
  template?: Template | null;
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [totals, setTotals] = useState<Totals>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalListens, setTotalListens] = useState(0);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    body: '',
    sendNow: true,
    testEmail: '',
    selectedTags: [] as string[],
    templateId: '',
  });
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tagForm, setTagForm] = useState({ name: '', color: '#7c3aed' });
  const [contactForm, setContactForm] = useState({ email: '', name: '', phone: '' });
  const [selectedTagByContact, setSelectedTagByContact] = useState<Record<string, string>>({});
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [automationForm, setAutomationForm] = useState({
    name: '',
    trigger: 'SIGNUP',
    delayMinutes: 0,
    subject: '',
    body: '',
    active: true,
    templateId: '',
  });
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [metaConfig, setMetaConfig] = useState<MetaConfig>({ pixelId: '', capiEnabled: false, accessToken: '' });
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({ name: '', subject: '', body: '', category: '' });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [sequenceForm, setSequenceForm] = useState<Partial<Sequence>>({
    name: '',
    description: '',
    trigger: 'SIGNUP',
    active: true,
  });
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
  const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);
  const [selectedTemplateForCampaign, setSelectedTemplateForCampaign] = useState<string>('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [noteByDeal, setNoteByDeal] = useState<Record<string, string>>({});

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) redirect('/');
    fetchData();
  }, [status, isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, campaignsRes, contactsRes, tagsRes, automationsRes, dealsRes, metaRes, templatesRes, sequencesRes] = await Promise.all([
        fetch('/api/admin/analytics/events'),
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/crm/contacts'),
        fetch('/api/admin/crm/tags'),
        fetch('/api/admin/crm/automations'),
        fetch('/api/admin/crm/deals'),
        fetch('/api/admin/crm/meta'),
        fetch('/api/admin/crm/templates'),
        fetch('/api/admin/crm/sequences'),
      ]);
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setTotals(data.totals || []);
        setEvents(data.recent || []);
        setTotalListens(data.totalListens || 0);
      }
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data);
      }
      if (contactsRes?.ok) {
        setContacts(await contactsRes.json());
      }
      if (tagsRes?.ok) {
        setTags(await tagsRes.json());
      }
      if (automationsRes?.ok) {
        setAutomations(await automationsRes.json());
      }
      if (dealsRes?.ok) {
        setDeals(await dealsRes.json());
      }
      if (metaRes?.ok) {
        setMetaConfig(await metaRes.json());
      }
      if (templatesRes?.ok) {
        setTemplates(await templatesRes.json());
      }
      if (sequencesRes?.ok) {
        const data = await sequencesRes.json();
        setSequences(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.body) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm),
      });
      if (!res.ok) throw new Error('Error al guardar la campana');
      toast.success(campaignForm.sendNow ? 'Campana creada y enviada' : 'Campana guardada como borrador');
      setCampaignForm({ name: '', subject: '', body: '', sendNow: true, testEmail: '', selectedTags: [], templateId: '' });
      setSelectedTemplateForCampaign('none');
      setShowPreview(false);
      fetchData();
    } catch (err) {
      toast.error('Error al guardar la campana');
    } finally {
      setSending(false);
    }
  };

  const submitTag = async () => {
    if (!tagForm.name) {
      toast.error('El nombre de la etiqueta es requerido');
      return;
    }
    try {
      const res = await fetch('/api/admin/crm/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagForm),
      });
      if (!res.ok) throw new Error('Error al crear etiqueta');
      setTagForm({ name: '', color: '#7c3aed' });
      toast.success('✨ Etiqueta creada exitosamente');
      fetchData();
    } catch (err) {
      toast.error('Error al crear la etiqueta');
    }
  };

  const submitContact = async () => {
    if (!contactForm.email) {
      toast.error('El email es requerido');
      return;
    }
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error('Error al crear contacto');
      setContactForm({ email: '', name: '', phone: '' });
      toast.success('👤 Contacto creado exitosamente');
      fetchData();
    } catch (err) {
      toast.error('Error al crear el contacto');
    }
  };

  const saveMetaConfig = async () => {
    try {
      const res = await fetch('/api/admin/crm/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaConfig),
      });
      if (!res.ok) throw new Error('Error al guardar configuración');
      toast.success('⚙️ Configuración de Meta Pixel guardada');
      fetchData();
    } catch (err) {
      toast.error('Error al guardar la configuración');
    }
  };

  const assignTag = async (contactId: string) => {
    const tagId = selectedTagByContact[contactId];
    if (!tagId) {
      toast.error('Selecciona una etiqueta');
      return;
    }
    try {
      const res = await fetch('/api/admin/crm/contacts/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, tagId }),
      });
      if (!res.ok) throw new Error('Error al asignar etiqueta');
      toast.success('🏷️ Etiqueta asignada correctamente');
      fetchData();
    } catch (err) {
      toast.error('Error al asignar la etiqueta');
    }
  };

  const removeTag = async (contactId: string, tagId: string) => {
    try {
      const res = await fetch(`/api/admin/crm/contacts/tags?contactId=${contactId}&tagId=${tagId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al remover etiqueta');
      toast.success('🗑️ Etiqueta removida');
      fetchData();
    } catch (err) {
      toast.error('Error al remover la etiqueta');
    }
  };

  const saveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      toast.error('Nombre, asunto y cuerpo son obligatorios');
      return;
    }
    const method = editingTemplateId ? 'PUT' : 'POST';
    const url = editingTemplateId ? `/api/admin/crm/templates?id=${editingTemplateId}` : '/api/admin/crm/templates';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateForm),
    });
    if (!res.ok) {
      toast.error('No se pudo guardar la plantilla');
      return;
    }
    setTemplateForm({ name: '', subject: '', body: '', category: '' });
    setEditingTemplateId(null);
    fetchData();
  };

  const editTemplate = (tpl: Template) => {
    setEditingTemplateId(tpl.id);
    setTemplateForm({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      category: tpl.category || '',
    });
  };

  const addSequenceStep = () => {
    setSequenceSteps((prev) => [
      ...prev,
      { subject: '', body: '', delayDays: 0, delayHours: 0 },
    ]);
  };

  const moveStep = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sequenceSteps.length) return;
    const copy = [...sequenceSteps];
    const [item] = copy.splice(index, 1);
    copy.splice(newIndex, 0, item);
    setSequenceSteps(copy);
  };

  const saveSequence = async () => {
    if (!sequenceForm.name || !sequenceForm.trigger) {
      toast.error('Nombre y trigger son obligatorios');
      return;
    }
    const method = editingSequenceId ? 'PUT' : 'POST';
    const url = editingSequenceId ? `/api/admin/crm/sequences?id=${editingSequenceId}` : '/api/admin/crm/sequences';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sequenceForm,
        steps: sequenceSteps,
      }),
    });
    if (!res.ok) {
      toast.error('No se pudo guardar la secuencia');
      return;
    }
    setEditingSequenceId(null);
    setSequenceForm({ name: '', description: '', trigger: 'SIGNUP', active: true });
    setSequenceSteps([]);
    fetchData();
  };

  const templateVariables = ['{{nombre}}', '{{email}}', '{{unsubscribe}}', '{{link_verificacion}}'];

  const insertVariable = (field: 'subject' | 'body', variable: string) => {
    if (field === 'subject') {
      setTemplateForm((prev) => ({ ...prev, subject: `${prev.subject || ''} ${variable}` }));
    } else {
      setTemplateForm((prev) => ({ ...prev, body: `${prev.body || ''} ${variable}` }));
    }
  };

  const submitAutomation = async () => {
    if (!automationForm.name || !automationForm.subject || !automationForm.body) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    try {
      const method = editingAutomationId ? 'PUT' : 'POST';
      const url = editingAutomationId
        ? `/api/admin/crm/automations?id=${editingAutomationId}`
        : '/api/admin/crm/automations';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationForm),
      });
      if (!res.ok) throw new Error('Error al guardar automatizaci?n');
      setAutomationForm({
        name: '',
        trigger: 'SIGNUP',
        delayMinutes: 0,
        subject: '',
        body: '',
        active: true,
        templateId: '',
      });
      setEditingAutomationId(null);
      toast.success(method === 'POST' ? 'Automatizaci?n creada' : 'Automatizaci?n actualizada');
      fetchData();
    } catch (err) {
      toast.error('Error al guardar la automatizaci?n');
    }
  };

  const startEditAutomation = (automation: Automation) => {
    setEditingAutomationId(automation.id);
    setAutomationForm({
      name: automation.name,
      trigger: automation.trigger,
      delayMinutes: automation.delayMinutes,
      subject: automation.subject,
      body: automation.body,
      active: automation.active,
      templateId: automation.templateId || '',
    });
  };

  const deleteAutomation = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/crm/automations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      if (editingAutomationId === id) {
        setEditingAutomationId(null);
        setAutomationForm({
          name: '',
          trigger: 'SIGNUP',
          delayMinutes: 0,
          subject: '',
          body: '',
          active: true,
          templateId: '',
        });
      }
      toast.success('Automatizaci?n eliminada');
      fetchData();
    } catch (err) {
      toast.error('No se pudo eliminar la automatizaci?n');
    }
  };

  const moveStage = async (deal: Deal, direction: number) => {
    const stages = ['LEAD', 'ACTIVE', 'RISK', 'CHURN'];
    const idx = stages.indexOf(deal.stage);
    const next = stages[idx + direction];
    if (!next) return;
    try {
      const res = await fetch(`/api/admin/crm/deals?id=${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: next }),
      });
      if (!res.ok) throw new Error('Error al actualizar deal');
      toast.success(`🎯 Deal movido a ${next}`);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar el deal');
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Teléfono', 'Rol', 'Etiquetas', 'Última actualización'];
    const rows = filteredContacts.map(c => [
      c.email,
      c.name || '',
      c.phone || '',
      c.role || '',
      c.tags?.map(t => t.tag.name).join('; ') || '',
      new Date(c.updatedAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contactos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Contactos exportados');
  };

  // Filtrar contactos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !filterTag || filterTag === 'all' ||
      contact.tags?.some(t => t.tag.id === filterTag);

    return matchesSearch && matchesTag;
  });

  // Paginación
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * contactsPerPage,
    currentPage * contactsPerPage
  );

  // KPIs
  const totalUsers = contacts.length;
  const signupCount = totals.find(t => t.type === 'SIGNUP')?._count?.type || 0;
  const emailVerifiedCount = totals.find(t => t.type === 'EMAIL_VERIFIED')?._count?.type || 0;
  const playCount = totalListens; // Usar el total de reproducciones de Audio.listens
  const conversionRate = signupCount > 0 ? ((emailVerifiedCount / signupCount) * 100).toFixed(1) : '0';

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando CRM..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="relative text-center py-16 mb-8 rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.2))'
        }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex p-6 rounded-full mb-6 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <BarChart3 className="h-16 w-16 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CRM & Analytics
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Panel completo de métricas, campañas de email y gestión de contactos para Calmify
            </p>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversión Email</CardTitle>
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{emailVerifiedCount} de {signupCount} verificados</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reproducciones</CardTitle>
              <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{playCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total de plays</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/10 to-red-500/10 blur-2xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
              <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{events.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Eventos recientes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-1 border-2 border-purple-200 dark:border-purple-800 flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contactos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Users className="w-4 h-4 mr-2" />
              Contactos
            </TabsTrigger>
            <TabsTrigger value="campanas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Mail className="w-4 h-4 mr-2" />
              Campañas
            </TabsTrigger>
            <TabsTrigger value="plantillas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="secuencias" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Layers className="w-4 h-4 mr-2" />
              Secuencias
            </TabsTrigger>
            <TabsTrigger value="automatizaciones" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Zap className="w-4 h-4 mr-2" />
              Automatizaciones
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Target className="w-4 h-4 mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="meta" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              <Settings className="w-4 h-4 mr-2" />
              Meta Pixel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Embudo de conversión */}
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Embudo de Conversión
                </CardTitle>
                <CardDescription>Visualiza el journey del usuario desde registro hasta engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'SIGNUP', label: 'Registros', icon: UserPlus, count: signupCount, color: 'from-indigo-500 to-purple-500' },
                    { type: 'EMAIL_VERIFIED', label: 'Emails Verificados', icon: Mail, count: emailVerifiedCount, color: 'from-purple-500 to-pink-500' },
                    { type: 'PLAY', label: 'Reproducciones', icon: Play, count: playCount, color: 'from-pink-500 to-red-500' },
                    { type: 'FAVORITE_ADDED', label: 'Favoritos Agregados', icon: Heart, count: totals.find(t => t.type === 'FAVORITE_ADDED')?._count?.type || 0, color: 'from-red-500 to-rose-500' },
                    { type: 'COMMENT_CREATED', label: 'Comentarios', icon: MessageCircle, count: totals.find(t => t.type === 'COMMENT_CREATED')?._count?.type || 0, color: 'from-rose-500 to-pink-500' },
                  ].map((stage, idx) => {
                    const Icon = stage.icon;
                    const percentage = signupCount > 0 ? ((stage.count / signupCount) * 100).toFixed(1) : '0';
                    return (
                      <div key={stage.type} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${stage.color}`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">{stage.label}</p>
                              <p className="text-sm text-muted-foreground">{stage.count} usuarios ({percentage}%)</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800">
                            {percentage}%
                          </Badge>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Eventos recientes */}
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimos {events.length} eventos del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 10).map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                            {ev.type}
                          </Badge>
                          {ev.audio?.title && <span className="text-sm text-muted-foreground">• {ev.audio.title}</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ev.user?.email || 'Usuario anónimo'} · {new Date(ev.createdAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!events.length && (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No hay eventos recientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contactos" className="space-y-6">
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Gestión de Contactos
                    </CardTitle>
                    <CardDescription>Administra y segmenta tu base de contactos</CardDescription>
                  </div>
                  <Button onClick={exportToCSV} variant="outline" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Crear contacto */}
                <div className="grid md:grid-cols-4 gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <Input
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="border-purple-200 dark:border-purple-800"
                  />
                  <Input
                    placeholder="Nombre"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="border-purple-200 dark:border-purple-800"
                  />
                  <Input
                    placeholder="Teléfono"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="border-purple-200 dark:border-purple-800"
                  />
                  <Button
                    onClick={submitContact}
                    disabled={!contactForm.email}
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear
                  </Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Input
                      placeholder="Buscar por email o nombre..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 border-2 hover:border-purple-300 dark:hover:border-purple-700"
                    />
                  </div>
                  <Select value={filterTag} onValueChange={(val) => {
                    setFilterTag(val);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-full md:w-[200px] border-2 hover:border-purple-300 dark:hover:border-purple-700">
                      <Filter className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                      <SelectValue placeholder="Filtrar por etiqueta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las etiquetas</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color || '#7c3aed' }}
                            />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de contactos */}
                <div className="space-y-2">
                  {paginatedContacts.map((c) => (
                    <div key={c.id} className="border rounded-lg p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-purple-950/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold">
                              {(c.name || c.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{c.name || c.email}</p>
                              <p className="text-sm text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {c.tags?.map((t) => (
                              <Badge
                                key={t.tag.id}
                                style={{ backgroundColor: t.tag.color || undefined }}
                                className="flex items-center gap-1"
                              >
                                {t.tag.name}
                                <button
                                  type="button"
                                  onClick={() => removeTag(c.id, t.tag.id)}
                                  className="ml-1 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.events?.length ? `${c.events.length} eventos` : 'Sin eventos'}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!paginatedContacts.length && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No se encontraron contactos</p>
                    </div>
                  )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * contactsPerPage + 1} - {Math.min(currentPage * contactsPerPage, filteredContacts.length)} de {filteredContacts.length} contactos
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Etiquetas */}
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Etiquetas
                </CardTitle>
                <CardDescription>Crea y asigna etiquetas para segmentar contactos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Nombre de etiqueta"
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  />
                  <Input
                    type="color"
                    value={tagForm.color || '#7c3aed'}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value || '#7c3aed' })}
                  />
                  <Button onClick={submitTag} disabled={!tagForm.name}>Crear etiqueta</Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((t) => (
                    <Badge key={t.id} style={{ backgroundColor: t.color || undefined }}>
                      {t.name}
                    </Badge>
                  ))}
                  {!tags.length && <p className="text-sm text-muted-foreground">Sin etiquetas creadas</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="campanas" className="space-y-6">
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Crear Campaña de Email
              </CardTitle>
              <CardDescription>Envía campañas segmentadas a tus contactos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedTemplateForCampaign || 'none'}
                onValueChange={(v) => {
                  if (v === 'none') {
                    setSelectedTemplateForCampaign('');
                    setCampaignForm((prev) => ({ ...prev, templateId: '' }));
                    return;
                  }
                  setSelectedTemplateForCampaign(v);
                  const tpl = templates.find((t) => t.id === v);
                  if (tpl) {
                    setCampaignForm((prev) => ({
                      ...prev,
                      subject: tpl.subject,
                      body: tpl.body,
                      templateId: tpl.id,
                    }));
                  } else {
                    setCampaignForm((prev) => ({ ...prev, templateId: '' }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Usar plantilla (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin plantilla</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Nombre interno de la campaña"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              />
              <Input
                  placeholder="Asunto del email"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                />
                <Textarea
                  placeholder="Cuerpo del email (HTML o texto plano)"
                  value={campaignForm.body}
                  onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />

                {/* Segmentación por tags */}
                <div className="space-y-2">
                  <Label>Segmentación (opcional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={campaignForm.selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        style={campaignForm.selectedTags.includes(tag.id) ? { backgroundColor: tag.color || undefined } : {}}
                        onClick={() => {
                          setCampaignForm(prev => ({
                            ...prev,
                            selectedTags: prev.selectedTags.includes(tag.id)
                              ? prev.selectedTags.filter(t => t !== tag.id)
                              : [...prev.selectedTags, tag.id]
                          }));
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  {campaignForm.selectedTags.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Enviando solo a contactos con las etiquetas seleccionadas
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="sendNow"
                      type="checkbox"
                      checked={campaignForm.sendNow}
                      onChange={(e) => setCampaignForm({ ...campaignForm, sendNow: e.target.checked })}
                    />
                    <Label htmlFor="sendNow" className="text-sm">Enviar ahora (usuarios verificados)</Label>
                  </div>
                  <Input
                    placeholder="Email de prueba (opcional)"
                    value={campaignForm.testEmail}
                    onChange={(e) => setCampaignForm({ ...campaignForm, testEmail: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Ver'} Preview
                  </Button>
                  <Button
                    onClick={submitCampaign}
                    disabled={sending || !campaignForm.name || !campaignForm.subject || !campaignForm.body}
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
                  >
                    {sending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Guardar/Enviar
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview del email - Mejorado */}
                {showPreview && campaignForm.body && (
                  <Card className="mt-4 border-2 border-purple-300 dark:border-purple-700 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-600" />
                        Preview del Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Simulación de cliente email */}
                      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              C
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Calmify</p>
                              <p className="text-xs text-muted-foreground">noreply@calmify.com</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Ahora
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{campaignForm.subject || '(Sin asunto)'}</h3>
                        <p className="text-xs text-muted-foreground">
                          Para: {campaignForm.selectedTags.length > 0
                            ? `Contactos con tags: ${tags.filter(t => campaignForm.selectedTags.includes(t.id)).map(t => t.name).join(', ')}`
                            : 'Todos los contactos verificados'}
                        </p>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-950">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
                          <div
                            className="prose dark:prose-invert max-w-none prose-headings:text-purple-900 dark:prose-headings:text-purple-100 prose-a:text-purple-600 dark:prose-a:text-purple-400"
                            dangerouslySetInnerHTML={{ __html: campaignForm.body }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Historial de campañas - Mejorado */}
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Historial de Campañas
                </CardTitle>
                <CardDescription>
                  {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} creada{campaigns.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.map((c) => (
                  <Card key={c.id} className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
                    </div>

                    <CardContent className="p-4 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg truncate group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                              {c.name}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            <Mail className="w-3 h-3 inline mr-1" />
                            {c.subject}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(c.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {c.recipients} destinatarios
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={c.status === 'SENT' ? 'default' : 'secondary'}
                          className={`flex items-center gap-1 ${c.status === 'SENT' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                        >
                          {c.status === 'SENT' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              ENVIADA
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              BORRADOR
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!campaigns.length && (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
                      <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                        <Mail className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay campañas creadas</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Crea tu primera campaña de email para comenzar a conectar con tus contactos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear / Editar plantilla</CardTitle>
              <CardDescription>Usa variables como {"{{nombre}}"} y {"{{email}}"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre"
                  value={templateForm.name || ''}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
                <Input
                  placeholder="Categoría (opcional)"
                  value={templateForm.category || ''}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                />
              </div>
              <Input
                placeholder="Asunto"
                value={templateForm.subject || ''}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              />
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="font-semibold">Variables rápidas:</span>
                {templateVariables.map((v) => (
                  <Button key={v} type="button" size="sm" variant="outline" onClick={() => insertVariable('body', v)}>
                    {v}
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Cuerpo (puedes usar HTML básico)"
                value={templateForm.body || ''}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                rows={8}
              />
              <div className="flex gap-2">
                <Button onClick={saveTemplate}>{editingTemplateId ? 'Actualizar' : 'Crear'} plantilla</Button>
                {editingTemplateId && (
                  <Button variant="outline" onClick={() => { setEditingTemplateId(null); setTemplateForm({ name: '', subject: '', body: '', category: '' }); }}>
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantillas guardadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{tpl.name}</div>
                    <div className="text-sm text-muted-foreground">{tpl.subject}</div>
                    <div className="text-xs text-muted-foreground">Actualizada {new Date(tpl.updatedAt).toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => editTemplate(tpl)}>Editar</Button>
                </div>
              ))}
              {!templates.length && <p className="text-sm text-muted-foreground">Sin plantillas.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secuencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secuencia (drip)</CardTitle>
              <CardDescription>Define pasos con delays.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre"
                  value={sequenceForm.name || ''}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })}
                />
                <Select
                  value={sequenceForm.trigger || 'SIGNUP'}
                  onValueChange={(v) => setSequenceForm({ ...sequenceForm, trigger: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {['SIGNUP', 'EMAIL_VERIFIED', 'PLAY', 'FAVORITE_ADDED', 'COMMENT_CREATED'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Descripción"
                value={sequenceForm.description || ''}
                onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!sequenceForm.active}
                  onCheckedChange={(checked) => setSequenceForm({ ...sequenceForm, active: checked })}
                />
                <span className="text-sm">Secuencia activa</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Pasos</p>
                  <Button size="sm" onClick={addSequenceStep}>Añadir paso</Button>
                </div>
                {sequenceSteps.map((step, idx) => (
                  <Card key={idx} className="border-dashed">
                    <CardContent className="space-y-2 pt-4">
                      <div className="grid md:grid-cols-3 gap-2">
                        <Input
                          placeholder="Asunto"
                          value={step.subject}
                          onChange={(e) => {
                            const copy = [...sequenceSteps];
                            copy[idx].subject = e.target.value;
                            setSequenceSteps(copy);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Delay días"
                          value={step.delayDays}
                          onChange={(e) => {
                            const copy = [...sequenceSteps];
                            copy[idx].delayDays = Number(e.target.value || 0);
                            setSequenceSteps(copy);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Delay horas"
                          value={step.delayHours}
                          onChange={(e) => {
                            const copy = [...sequenceSteps];
                            copy[idx].delayHours = Number(e.target.value || 0);
                            setSequenceSteps(copy);
                          }}
                        />
                      </div>
                      <Textarea
                        placeholder="Cuerpo"
                        value={step.body}
                        onChange={(e) => {
                          const copy = [...sequenceSteps];
                          copy[idx].body = e.target.value;
                          setSequenceSteps(copy);
                        }}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => moveStep(idx, -1)} disabled={idx === 0}>
                          <ArrowLeft className="w-4 h-4 mr-1" /> Arriba
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => moveStep(idx, 1)} disabled={idx === sequenceSteps.length - 1}>
                          Abajo <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!sequenceSteps.length && (
                  <p className="text-sm text-muted-foreground">No hay pasos todavía.</p>
                )}
              </div>
              <Button onClick={saveSequence}>{editingSequenceId ? 'Actualizar' : 'Crear'} secuencia</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secuencias guardadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sequences.map((seq) => (
                <div key={seq.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{seq.name}</div>
                    <div className="text-sm text-muted-foreground">Trigger {seq.trigger} · {seq.steps.length} pasos</div>
                    <div className="text-xs text-muted-foreground">Actualizada {new Date(seq.updatedAt).toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingSequenceId(seq.id);
                    setSequenceForm({
                      name: seq.name,
                      description: seq.description || '',
                      trigger: seq.trigger,
                      active: seq.active,
                    });
                    setSequenceSteps(seq.steps.map((s: any) => ({
                      subject: s.subject,
                      body: s.body,
                      delayDays: s.delayDays,
                      delayHours: s.delayHours,
                    })));
                  }}>
                    Editar
                  </Button>
                </div>
              ))}
              {!sequences.length && <p className="text-sm text-muted-foreground">Sin secuencias.</p>}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="automatizaciones" className="space-y-6">
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Crear Automatización
                </CardTitle>
                <CardDescription>Configura emails automáticos basados en eventos del usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nombre de la automatización"
                  value={automationForm.name}
                  onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                />
                <div className="grid md:grid-cols-3 gap-3">
                  <Select
                    value={automationForm.trigger}
                    onValueChange={(value) => setAutomationForm({ ...automationForm, trigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {['SIGNUP', 'EMAIL_VERIFIED', 'PLAY', 'FAVORITE_ADDED', 'COMMENT_CREATED'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <Input
                  type="number"
                  min={0}
                  value={automationForm.delayMinutes}
                  onChange={(e) => setAutomationForm({ ...automationForm, delayMinutes: Number(e.target.value) })}
                  placeholder="Delay (minutos, 0 = inmediato)"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={automationForm.active}
                    onCheckedChange={(checked) => setAutomationForm({ ...automationForm, active: checked })}
                  />
                  <Label>Activa</Label>
                </div>
              </div>
              <Select
                value={automationForm.templateId || 'none'}
                onValueChange={(v) => setAutomationForm({ ...automationForm, templateId: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Usar plantilla (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin plantilla</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Asunto del email"
                value={automationForm.subject}
                onChange={(e) => setAutomationForm({ ...automationForm, subject: e.target.value })}
              />
                <Textarea
                  placeholder="Cuerpo del email (HTML o texto)"
                  value={automationForm.body}
                  onChange={(e) => setAutomationForm({ ...automationForm, body: e.target.value })}
                  rows={5}
                />
                <Button
                  onClick={submitAutomation}
                  disabled={!automationForm.name || !automationForm.subject || !automationForm.body}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {editingAutomationId ? 'Actualizar automatización' : 'Guardar automatización'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Automatizaciones Existentes
                </CardTitle>
                <CardDescription>
                  {automations.length} automatización{automations.length !== 1 ? 'es' : ''} configurada{automations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {automations.map((a) => (
                  <Card key={a.id} className="relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-300">
                      <div className={`w-full h-full rounded-full blur-2xl ${a.active ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'}`} />
                    </div>

                    <CardContent className="p-4 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className={`w-4 h-4 ${a.active ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <h4 className="font-bold text-lg truncate group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                              {a.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              {a.trigger}
                            </Badge>
                            {a.delayMinutes > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {a.delayMinutes}m delay
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                            <Mail className="w-3 h-3 inline mr-1" />
                            {a.subject}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{a.body.substring(0, 100)}...</p>
                        </div>
                        <Badge
                          variant={a.active ? 'default' : 'secondary'}
                          className={`flex items-center gap-1 ${a.active ? 'bg-gradient-to-r from-green-600 to-emerald-600 animate-pulse' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                        >
                          {a.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              ACTIVA
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              PAUSADA
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditAutomation(a)} className="h-8">
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteAutomation(a.id)} className="h-8">
                            Eliminar
                          </Button>
                        </div>
                        {a.template ? (
                          <Badge variant="secondary" className="text-xs">
                            Plantilla: {a.template.name}
                          </Badge>
                        ) : (
                          <div className="text-xs text-muted-foreground">Sin plantilla</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!automations.length && (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 blur-2xl animate-pulse" />
                      <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center">
                        <Zap className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay automatizaciones configuradas</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Crea automatizaciones para enviar emails automáticamente cuando ocurran eventos específicos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Resumen del Pipeline
                </CardTitle>
                <CardDescription>Visualiza el estado de tus deals por etapa del funnel</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['LEAD', 'ACTIVE', 'RISK', 'CHURN'].map((stage) => {
                  const count = deals.filter((d) => d.stage === stage).length;
                  const totalDeals = deals.length || 1;
                  const percentage = Math.round((count / totalDeals) * 100);
                  const colors = {
                    LEAD: { gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30', text: 'text-blue-600 dark:text-blue-400' },
                    ACTIVE: { gradient: 'from-green-500 to-emerald-500', bg: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30', text: 'text-green-600 dark:text-green-400' },
                    RISK: { gradient: 'from-yellow-500 to-orange-500', bg: 'from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
                    CHURN: { gradient: 'from-red-500 to-pink-500', bg: 'from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30', text: 'text-red-600 dark:text-red-400' }
                  };
                  const stageInfo = colors[stage as keyof typeof colors];

                  return (
                    <Card key={stage} className={`relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-gradient-to-br ${stageInfo.bg}`}>
                      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300">
                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${stageInfo.gradient} opacity-20 blur-2xl`} />
                      </div>
                      <CardContent className="p-4 relative">
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wide ${stageInfo.text}">{stage}</p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <p className={`text-4xl font-bold bg-gradient-to-r ${stageInfo.gradient} bg-clip-text text-transparent`}>{count}</p>
                          <p className="text-sm text-muted-foreground">{percentage}%</p>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${stageInfo.gradient} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-4 gap-4">
              {['LEAD', 'ACTIVE', 'RISK', 'CHURN'].map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage);
                const stageColors = {
                  LEAD: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', border: 'border-blue-200 dark:border-blue-800' },
                  ACTIVE: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20', border: 'border-green-200 dark:border-green-800' },
                  RISK: { gradient: 'from-yellow-500 to-orange-500', bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20', border: 'border-yellow-200 dark:border-yellow-800' },
                  CHURN: { gradient: 'from-red-500 to-pink-500', bg: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20', border: 'border-red-200 dark:border-red-800' }
                };
                const stageInfo = stageColors[stage as keyof typeof stageColors];

                return (
                  <Card key={stage} className={`border-2 ${stageInfo.border} transition-all duration-300 ${stageInfo.bg}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-lg font-bold bg-gradient-to-r ${stageInfo.gradient} bg-clip-text text-transparent`}>
                        {stage}
                      </CardTitle>
                      <CardDescription className="text-xs">{stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stageDeals.map((deal) => (
                        <Card key={deal.id} className="border-2 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 group">
                          <CardContent className="p-3 space-y-2">
                            <h4 className="font-bold text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {deal.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span className="truncate">{deal.contact?.name || deal.contact?.email || 'Sin contacto'}</span>
                            </div>
                            {deal.value && (
                              <Badge variant="outline" className={`text-xs bg-gradient-to-r ${stageInfo.gradient} text-white border-0`}>
                                ${deal.value.toLocaleString()}
                              </Badge>
                            )}
                            <div className="flex gap-1 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moveStage(deal, -1)}
                                disabled={stage === 'LEAD'}
                                className="flex-1 h-7 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-30"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moveStage(deal, 1)}
                                disabled={stage === 'CHURN'}
                                className="flex-1 h-7 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-30"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {stageDeals.length === 0 && (
                        <div className="text-center py-8">
                          <Target className={`w-8 h-8 mx-auto mb-2 opacity-30 ${stageInfo.border.replace('border-', 'text-')}`} />
                          <p className="text-xs text-muted-foreground">Sin deals</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Configuración Meta Pixel / CAPI
                </CardTitle>
                <CardDescription>Configura el seguimiento de conversiones de Facebook/Meta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Pixel ID"
                  value={metaConfig.pixelId || ''}
                  onChange={(e) => setMetaConfig({ ...metaConfig, pixelId: e.target.value })}
                />
                <Input
                  placeholder="Access Token (CAPI)"
                  type="password"
                  value={metaConfig.accessToken || ''}
                  onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!metaConfig.capiEnabled}
                    onCheckedChange={(checked) => setMetaConfig({ ...metaConfig, capiEnabled: checked })}
                  />
                  <Label>Habilitar Conversion API (server-side)</Label>
                </div>
                <Button
                  onClick={saveMetaConfig}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
                >
                  Guardar configuración
                </Button>
                <p className="text-xs text-muted-foreground">
                  Para Conversion API necesitas definir PIXEL_ID y META_ACCESS_TOKEN en variables de entorno; aquí guardas el ID y el toggle.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
