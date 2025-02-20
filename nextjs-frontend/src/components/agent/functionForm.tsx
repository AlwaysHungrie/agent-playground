import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MdAdd, MdRemove, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { LlmFunctionConfig, LlmFunctionProperty } from '@/app/[userAddress]/page';

const ParameterField = ({
  parameter,
  onUpdate,
  onDelete,
  index
}: {
  parameter: LlmFunctionProperty;
  onUpdate: (index: number, updatedParam: LlmFunctionProperty) => void;
  onDelete: (index: number) => void;
  index: number;
}) => {
  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Input
          value={parameter.name}
          onChange={(e) => onUpdate(index, { ...parameter, name: e.target.value })}
          placeholder="Parameter name"
          className="flex-1"
        />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDelete(index)}
          className="h-8 w-8"
        >
          <MdRemove className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="checkbox"
            checked={parameter.isRequired}
            onChange={(e) => onUpdate(index, { ...parameter, isRequired: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="text-sm">Required</label>
        </div>

        <select 
          className="flex-1 p-1.5 text-sm rounded border border-gray-200"
          value={parameter.type}
          onChange={(e) => onUpdate(index, { ...parameter, type: e.target.value })}
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
        </select>
      </div>
      
      <Textarea
        value={parameter.description}
        onChange={(e) => onUpdate(index, { ...parameter, description: e.target.value })}
        placeholder="Parameter description"
        className="min-h-16 text-sm"
      />
    </div>
  );
};

const FunctionForm = ({
  llmFunction,
  updateLlmFunction,
  onDelete,
}: {
  llmFunction: LlmFunctionConfig;
  updateLlmFunction: (updatedFunction: LlmFunctionConfig) => void;
  onDelete?: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleParameterUpdate = (index: number, updatedParam: LlmFunctionProperty) => {
    const newProperties = [...llmFunction.parameters.properties];
    newProperties[index] = updatedParam;
    
    updateLlmFunction({
      ...llmFunction,
      parameters: {
        ...llmFunction.parameters,
        properties: newProperties
      }
    });
  };

  const handleParameterDelete = (index: number) => {
    const newProperties = llmFunction.parameters.properties.filter((_, i) => i !== index);
    
    updateLlmFunction({
      ...llmFunction,
      parameters: {
        ...llmFunction.parameters,
        properties: newProperties,
      }
    });
  };

  const addNewParameter = () => {
    const newParameter: LlmFunctionProperty = {
      type: 'string',
      name: 'New Parameter',
      description: 'Parameter description',
      isRequired: false
    };
    
    updateLlmFunction({
      ...llmFunction,
      parameters: {
        ...llmFunction.parameters,
        properties: [...llmFunction.parameters.properties, newParameter]
      }
    });
  };

  return (
    <Card className="border border-gray-200 rounded-md">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1 text-base font-medium"
            value={llmFunction.name}
            onChange={(e) => updateLlmFunction({ ...llmFunction, name: e.target.value })}
            placeholder="Function name"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <MdExpandLess className="w-4 h-4" />
            ) : (
              <MdExpandMore className="w-4 h-4" />
            )}
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(llmFunction.id)}
              className="h-8 w-8"
            >
              <MdRemove className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isExpanded && (
          <>
            <Textarea
              value={llmFunction.description}
              onChange={(e) => updateLlmFunction({
                ...llmFunction,
                description: e.target.value
              })}
              placeholder="Function description"
              className="min-h-16 text-sm"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Parameters</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewParameter}
                  className="h-7 px-2 flex items-center gap-1"
                >
                  <MdAdd className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {llmFunction.parameters.properties.map((param, index) => (
                  <ParameterField
                    key={index}
                    index={index}
                    parameter={param}
                    onUpdate={handleParameterUpdate}
                    onDelete={handleParameterDelete}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FunctionForm;