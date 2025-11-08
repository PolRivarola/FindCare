import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PaginationControlsProps = {
  page: number
  totalPages: number
  count: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  disabled?: boolean
}

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

export function PaginationControls({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
  disabled = false,
}: PaginationControlsProps) {
  const clampedPage = totalPages === 0 ? 0 : Math.min(page, totalPages)
  const start = totalPages === 0 ? 0 : (clampedPage - 1) * pageSize + 1
  const end =
    totalPages === 0
      ? 0
      : Math.min(clampedPage * pageSize, count)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 border-t pt-4 md:flex-row",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        {count === 0
          ? "No hay resultados para mostrar"
          : `Mostrando ${start}–${end} de ${count} registros`}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm">
            <span>Tamaño de página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem value={String(size)} key={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || clampedPage <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalPages === 0 ? "0 de 0" : `${clampedPage} de ${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={
              disabled || totalPages === 0 || clampedPage >= totalPages
            }
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

