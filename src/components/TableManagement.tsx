import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import type { Table } from '../App';

interface TableManagementProps {
  tables: Table[];
  onAddTable: (table: Table) => void;
  onUpdateTable: (tableId: string, table: Table) => void;
  onDeleteTable: (tableId: string) => void;
}

export function TableManagement({ tables, onAddTable, onUpdateTable, onDeleteTable }: TableManagementProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: 0,
    seats: 2,
  });

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        seats: table.seats,
      });
    } else {
      setEditingTable(null);
      const maxNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) : 0;
      setFormData({ number: maxNumber + 1, seats: 2 });
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingTable) {
      onUpdateTable(editingTable.id, {
        ...editingTable,
        ...formData,
      });
    } else {
      onAddTable({
        id: Date.now().toString(),
        ...formData,
        status: 'available',
      });
    }
    setShowDialog(false);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-xl">Управління столами</CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати стіл
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className={`p-4 rounded-xl border-2 ${
                table.status === 'available'
                  ? 'border-green-600 bg-green-900/20'
                  : 'border-red-600 bg-red-900/20'
              }`}
            >
              <div className="text-center mb-3">
                <p className="text-white text-2xl">Стіл {table.number}</p>
                <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mt-1">
                  <Users className="w-3 h-3" />
                  <span>{table.seats} місць</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpenDialog(table)}
                  className="flex-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteTable(table.id)}
                  className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  disabled={table.status === 'occupied'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Редагувати стіл' : 'Додати стіл'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Номер столу</Label>
              <Input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white mt-2"
                min="1"
              />
            </div>

            <div>
              <Label className="text-gray-300">Кількість місць</Label>
              <Input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white mt-2"
                min="1"
                max="20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
